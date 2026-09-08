import {
  Inject,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, MoreThan, Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { User, UserStatus } from "../users/user.entity";
import { UsersService } from "../users/users.service";
import { Student } from "../students/student.entity";
import { RefreshToken } from "./refresh-token.entity";
import { OtpCode } from "./otp.entity";
import { OTP_SENDER, type OtpSender } from "./providers/otp-sender.interface";
import type { LoginDto } from "./dto/login.dto";
import type { OtpVerifyDto } from "./dto/otp-verify.dto";
import { SignupDto, SignupRole } from "./dto/signup.dto";
import { Role } from "../../common/enums/role.enum";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { ActivityTone } from "../activity-log/activity-log.entity";
import {
  EnrollmentCode,
  EnrollmentCodeStatus,
} from "../enrollment-codes/enrollment-code.entity";
import { RosterSource } from "../teachers/teacher.entity";

const OTP_TTL_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const REFRESH_TOKEN_TTL_DAYS = 30;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    @InjectRepository(OtpCode) private readonly otpCodes: Repository<OtpCode>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(EnrollmentCode)
    private readonly enrollmentCodesRepository: Repository<EnrollmentCode>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(OTP_SENDER) private readonly otpSender: OtpSender,
    private readonly activityLog: ActivityLogService,
  ) {}

  private hashToken(rawToken: string) {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, role: user.role, schoolId: user.schoolId };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get("JWT_ACCESS_EXPIRES_IN") ?? "15m",
    });
    const refreshTokenValue = crypto.randomBytes(48).toString("hex");
    const tokenHash = this.hashToken(refreshTokenValue);
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.refreshTokens.save(
      this.refreshTokens.create({ userId: user.id, tokenHash, expiresAt }),
    );

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: this.toPublicUser(user),
    };
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
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        "Too many failed attempts — try again later",
      );
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= LOGIN_MAX_ATTEMPTS) {
        user.lockedUntil = new Date(
          Date.now() + LOGIN_LOCKOUT_MINUTES * 60 * 1000,
        );
        user.failedLoginAttempts = 0;
      }
      await this.usersRepository.save(user);
      throw new UnauthorizedException("Invalid email or password");
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("This account is not active");
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await this.usersRepository.save(user);
    }
    await this.usersService.touchLastLogin(user.id);
    await this.activityLog.record({
      actorName: user.name,
      actorUserId: user.id,
      action: "تسجيل دخول",
      target: user.email ?? user.name,
      tone: ActivityTone.SUCCESS,
    });
    return this.issueTokens(user);
  }

  async requestOtp(email: string) {
    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await this.otpCodes.save(
      this.otpCodes.create({ email, codeHash, expiresAt }),
    );
    await this.otpSender.send(email, code);

    return { sent: true, expiresInSeconds: OTP_TTL_MINUTES * 60 };
  }

  async verifyOtp(dto: OtpVerifyDto) {
    const candidate = await this.otpCodes.findOne({
      where: {
        email: dto.email,
        consumed: false,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: "DESC" },
    });
    if (!candidate)
      throw new BadRequestException(
        "No active verification code for this email",
      );

    if (candidate.attempts >= OTP_MAX_ATTEMPTS) {
      candidate.consumed = true;
      await this.otpCodes.save(candidate);
      throw new BadRequestException(
        "Too many incorrect attempts — request a new code",
      );
    }

    const matches = await bcrypt.compare(dto.code, candidate.codeHash);
    if (!matches) {
      candidate.attempts += 1;
      await this.otpCodes.save(candidate);
      throw new BadRequestException("Incorrect verification code");
    }

    candidate.consumed = true;
    await this.otpCodes.save(candidate);

    const user = await this.usersService.findByEmail(dto.email);
    if (!user)
      throw new BadRequestException(
        "No account found for this email — sign up first",
      );
    if (user.status === UserStatus.DISABLED) {
      throw new UnauthorizedException("This account is disabled");
    }

    await this.usersService.touchLastLogin(user.id);
    return this.issueTokens(user);
  }

  async signup(dto: SignupDto) {
    if (await this.usersRepository.exists({ where: { email: dto.email } })) {
      throw new ConflictException("An account with this email already exists");
    }
    if (dto.role === SignupRole.PARENT) {
      return this.usersRepository.save(
        this.usersRepository.create({
          name: dto.name,
          email: dto.email,
          phone: dto.phone ?? null,
          role: Role.PARENT,
          status: UserStatus.ACTIVE,
        }),
      );
    }

    const normalizedCode = dto.enrollmentCode?.trim().toUpperCase();
    const existingRoster = await this.studentsRepository.findOne({
      where: { studentEmail: dto.email },
    });
    if (!normalizedCode && !existingRoster) {
      throw new BadRequestException(
        "A valid school enrollment code is required",
      );
    }
    if (dto.parentEmail?.toLowerCase() === dto.email.toLowerCase()) {
      throw new BadRequestException(
        "Student and parent must use different email addresses",
      );
    }

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      role: Role.STUDENT,
      status: UserStatus.PENDING_CONSENT,
      schoolId: existingRoster?.schoolId ?? null,
    });

    return this.usersRepository.manager.transaction(async (manager) => {
      let code: EnrollmentCode | null = null;
      if (normalizedCode) {
        code = await manager.findOne(EnrollmentCode, {
          where: { code: normalizedCode },
          lock: { mode: "pessimistic_write" },
        });
        if (!code) throw new BadRequestException("Invalid enrollment code");
        if (code.status !== EnrollmentCodeStatus.ACTIVE) {
          throw new BadRequestException(
            "This enrollment code is no longer active",
          );
        }
        if (new Date(code.expiresAt) < new Date()) {
          throw new BadRequestException("This enrollment code has expired");
        }
        if (code.currentUses >= code.maxUses) {
          throw new BadRequestException(
            "This enrollment code has reached its usage limit",
          );
        }
        if (existingRoster && existingRoster.schoolId !== code.schoolId) {
          throw new BadRequestException(
            "Enrollment code does not belong to the student school",
          );
        }
        user.schoolId = code.schoolId;
      }

      const saved = await manager.save(user);

      const parentEmail = dto.parentEmail ?? existingRoster?.parentEmail;
      const parentName = dto.parentName ?? existingRoster?.parentName;
      if (!parentEmail || !parentName) {
        throw new BadRequestException("Parent name and email are required");
      }
      let parent = await manager.findOne(User, {
        where: { email: parentEmail },
      });
      if (parent && parent.role !== Role.PARENT) {
        throw new BadRequestException(
          "Parent email belongs to a different account type",
        );
      }
      if (!parent) {
        parent = await manager.save(
          manager.create(User, {
            name: parentName,
            email: parentEmail,
            phone: dto.parentPhone ?? null,
            role: Role.PARENT,
            status: UserStatus.ACTIVE,
          }),
        );
      }

      const rosterRow = existingRoster ?? manager.create(Student);
      if (rosterRow.userId && rosterRow.userId !== saved.id) {
        throw new ConflictException(
          "This student roster record is already linked to an account",
        );
      }
      rosterRow.userId = saved.id;
      rosterRow.name = dto.name;
      rosterRow.parentName = parentName;
      rosterRow.parentEmail = parentEmail;
      rosterRow.studentEmail = dto.email;
      rosterRow.stage = dto.stage ?? existingRoster?.stage ?? "غير محدد";
      if (code) {
        rosterRow.schoolId = code.schoolId;
        rosterRow.classId = code.classId;
        rosterRow.source = RosterSource.SELF_ENROLLED;
        code.currentUses += 1;
        await manager.save(code);
      }
      await manager.save(rosterRow);
      return saved;
    });
  }

  async giveParentConsent(parentId: string, studentId: string) {
    const parent = await this.usersService.findOne(parentId);
    const student = await this.usersService.findOne(studentId);
    if (student.role !== Role.STUDENT) {
      throw new BadRequestException(
        "Consent can only be granted for a student account",
      );
    }
    const rosterRow = await this.studentsRepository.findOne({
      where: { userId: studentId },
    });
    if (
      !rosterRow ||
      !parent.email ||
      !rosterRow.parentEmail ||
      parent.email.toLowerCase() !== rosterRow.parentEmail.toLowerCase()
    ) {
      throw new UnauthorizedException(
        "This parent account is not authorized for the student",
      );
    }

    student.status = UserStatus.ACTIVE;
    rosterRow.parentUserId = parentId;
    await this.usersRepository.manager.transaction(async (manager) => {
      await manager.save(student);
      await manager.save(rosterRow);
    });

    return this.toPublicUser(student);
  }

  async refresh(refreshTokenValue: string) {
    const tokenHash = this.hashToken(refreshTokenValue);
    const candidate = await this.refreshTokens.findOne({
      where: { tokenHash, revoked: false, expiresAt: MoreThan(new Date()) },
      relations: ["user"],
    });
    if (!candidate)
      throw new UnauthorizedException("Invalid or expired refresh token");
    if (candidate.user.status === UserStatus.DISABLED) {
      candidate.revoked = true;
      await this.refreshTokens.save(candidate);
      throw new UnauthorizedException("This account is not active");
    }
    candidate.revoked = true;
    await this.refreshTokens.save(candidate);
    return this.issueTokens(candidate.user);
  }

  async logout(refreshTokenValue: string) {
    const tokenHash = this.hashToken(refreshTokenValue);
    await this.refreshTokens.update(
      { tokenHash, revoked: false },
      { revoked: true },
    );
    return { loggedOut: true };
  }

  async me(userId: string) {
    const user = await this.usersService.findOne(userId);
    return this.toPublicUser(user);
  }

  async purgeExpiredOtps() {
    await this.otpCodes.delete({ expiresAt: LessThan(new Date()) });
  }
}
