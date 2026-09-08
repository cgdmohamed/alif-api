import { Inject, Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThan, MoreThan, Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import { User, UserStatus } from '../users/user.entity'
import { UsersService } from '../users/users.service'
import { Student } from '../students/student.entity'
import { RefreshToken } from './refresh-token.entity'
import { OtpCode } from './otp.entity'
import { OTP_SENDER, type OtpSender } from './providers/otp-sender.interface'
import type { LoginDto } from './dto/login.dto'
import type { OtpVerifyDto } from './dto/otp-verify.dto'
import { SignupDto, SignupRole } from './dto/signup.dto'
import { Role } from '../../common/enums/role.enum'
import { ActivityLogService } from '../activity-log/activity-log.service'
import { ActivityTone } from '../activity-log/activity-log.entity'

const OTP_TTL_MINUTES = 5
const OTP_MAX_ATTEMPTS = 5
const REFRESH_TOKEN_TTL_DAYS = 30
const LOGIN_MAX_ATTEMPTS = 5
const LOGIN_LOCKOUT_MINUTES = 15

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    @InjectRepository(OtpCode) private readonly otpCodes: Repository<OtpCode>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(OTP_SENDER) private readonly otpSender: OtpSender,
    private readonly activityLog: ActivityLogService,
  ) {}

  private hashToken(rawToken: string) {
    return crypto.createHash('sha256').update(rawToken).digest('hex')
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, role: user.role, schoolId: user.schoolId }
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    })
    const refreshTokenValue = crypto.randomBytes(48).toString('hex')
    const tokenHash = this.hashToken(refreshTokenValue)
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)

    await this.refreshTokens.save(this.refreshTokens.create({ userId: user.id, tokenHash, expiresAt }))

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: this.toPublicUser(user),
    }
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      schoolId: user.schoolId,
      status: user.status,
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email)
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password')
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Too many failed attempts — try again later')
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) {
      user.failedLoginAttempts += 1
      if (user.failedLoginAttempts >= LOGIN_MAX_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOGIN_LOCKOUT_MINUTES * 60 * 1000)
        user.failedLoginAttempts = 0
      }
      await this.usersRepository.save(user)
      throw new UnauthorizedException('Invalid email or password')
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('This account is not active')
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      user.failedLoginAttempts = 0
      user.lockedUntil = null
      await this.usersRepository.save(user)
    }
    await this.usersService.touchLastLogin(user.id)
    await this.activityLog.record({
      actorName: user.name,
      actorUserId: user.id,
      action: 'تسجيل دخول',
      target: user.email ?? user.name,
      tone: ActivityTone.SUCCESS,
    })
    return this.issueTokens(user)
  }

  async requestOtp(email: string) {
    const code = String(crypto.randomInt(100000, 1000000))
    const codeHash = await bcrypt.hash(code, 10)
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)

    await this.otpCodes.save(this.otpCodes.create({ email, codeHash, expiresAt }))
    await this.otpSender.send(email, code)

    return { sent: true, expiresInSeconds: OTP_TTL_MINUTES * 60 }
  }

  async verifyOtp(dto: OtpVerifyDto) {
    const candidate = await this.otpCodes.findOne({
      where: {
        email: dto.email,
        consumed: false,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    })
    if (!candidate) throw new BadRequestException('No active verification code for this email')

    if (candidate.attempts >= OTP_MAX_ATTEMPTS) {
      candidate.consumed = true
      await this.otpCodes.save(candidate)
      throw new BadRequestException('Too many incorrect attempts — request a new code')
    }

    const matches = await bcrypt.compare(dto.code, candidate.codeHash)
    if (!matches) {
      candidate.attempts += 1
      await this.otpCodes.save(candidate)
      throw new BadRequestException('Incorrect verification code')
    }

    candidate.consumed = true
    await this.otpCodes.save(candidate)

    const user = await this.usersService.findByEmail(dto.email)
    if (!user) throw new BadRequestException('No account found for this email — sign up first')
    if (user.status === UserStatus.DISABLED) {
      throw new UnauthorizedException('This account is disabled')
    }

    await this.usersService.touchLastLogin(user.id)
    return this.issueTokens(user)
  }

  async signup(dto: SignupDto) {
    if (await this.usersRepository.exists({ where: { email: dto.email } })) {
      throw new ConflictException('An account with this email already exists')
    }
    const status = dto.role === SignupRole.STUDENT ? UserStatus.PENDING_CONSENT : UserStatus.ACTIVE
    const rosterRow =
      dto.role === SignupRole.STUDENT
        ? await this.studentsRepository.findOne({
            where: { studentEmail: dto.email },
          })
        : null
    if (dto.role === SignupRole.STUDENT && !rosterRow) {
      throw new BadRequestException('This student email is not registered by a school')
    }
    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      role: dto.role as unknown as Role,
      status,
      schoolId: rosterRow?.schoolId ?? null,
    })
    return this.usersRepository.manager.transaction(async (manager) => {
      const saved = await manager.save(user)
      if (rosterRow) {
        rosterRow.userId = saved.id
        await manager.save(rosterRow)
      }
      return saved
    })
  }

  async giveParentConsent(parentId: string, studentId: string) {
    const parent = await this.usersService.findOne(parentId)
    const student = await this.usersService.findOne(studentId)
    if (student.role !== Role.STUDENT) {
      throw new BadRequestException('Consent can only be granted for a student account')
    }
    const rosterRow = await this.studentsRepository.findOne({
      where: { userId: studentId },
    })
    if (
      !rosterRow ||
      !parent.email ||
      !rosterRow.parentEmail ||
      parent.email.toLowerCase() !== rosterRow.parentEmail.toLowerCase()
    ) {
      throw new UnauthorizedException('This parent account is not authorized for the student')
    }

    student.status = UserStatus.ACTIVE
    rosterRow.parentUserId = parentId
    await this.usersRepository.manager.transaction(async (manager) => {
      await manager.save(student)
      await manager.save(rosterRow)
    })

    return this.toPublicUser(student)
  }

  async refresh(refreshTokenValue: string) {
    const tokenHash = this.hashToken(refreshTokenValue)
    const candidate = await this.refreshTokens.findOne({
      where: { tokenHash, revoked: false, expiresAt: MoreThan(new Date()) },
      relations: ['user'],
    })
    if (!candidate) throw new UnauthorizedException('Invalid or expired refresh token')
    if (candidate.user.status !== UserStatus.ACTIVE) {
      candidate.revoked = true
      await this.refreshTokens.save(candidate)
      throw new UnauthorizedException('This account is not active')
    }
    candidate.revoked = true
    await this.refreshTokens.save(candidate)
    return this.issueTokens(candidate.user)
  }

  async logout(refreshTokenValue: string) {
    const tokenHash = this.hashToken(refreshTokenValue)
    await this.refreshTokens.update({ tokenHash, revoked: false }, { revoked: true })
    return { loggedOut: true }
  }

  async me(userId: string) {
    const user = await this.usersService.findOne(userId)
    return this.toPublicUser(user)
  }

  async purgeExpiredOtps() {
    await this.otpCodes.delete({ expiresAt: LessThan(new Date()) })
  }
}
