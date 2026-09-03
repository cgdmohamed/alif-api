import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EnrollmentCode, EnrollmentCodeStatus, EnrollmentCodeType } from './enrollment-code.entity'
import { Student } from '../students/student.entity'
import { RosterSource } from '../teachers/teacher.entity'
import { User } from '../users/user.entity'
import type { CreateEnrollmentCodeDto } from './dto/create-enrollment-code.dto'

function generateCodeString() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `ALEF-${part()}-${part()}`
}

@Injectable()
export class EnrollmentCodesService {
  constructor(
    @InjectRepository(EnrollmentCode)
    private readonly codesRepository: Repository<EnrollmentCode>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAllForSchool(schoolId: string) {
    return this.codesRepository.find({ where: { schoolId }, order: { createdAt: 'DESC' } })
  }

  create(schoolId: string, dto: CreateEnrollmentCodeDto) {
    const code = this.codesRepository.create({
      schoolId,
      code: generateCodeString(),
      classId: dto.classId,
      codeType: dto.codeType,
      maxUses: dto.codeType === EnrollmentCodeType.SINGLE ? 1 : dto.maxUses,
      currentUses: 0,
      expiresAt: dto.expiresAt,
      status: EnrollmentCodeStatus.ACTIVE,
    })
    return this.codesRepository.save(code)
  }

  async disable(id: string) {
    const code = await this.codesRepository.findOne({ where: { id } })
    if (!code) throw new NotFoundException('Enrollment code not found')
    code.status = EnrollmentCodeStatus.DISABLED
    return this.codesRepository.save(code)
  }

  async redeem(rawCode: string, userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('Account not found')

    const code = await this.codesRepository.findOne({ where: { code: rawCode } })
    if (!code) throw new NotFoundException('Invalid enrollment code')
    if (code.status !== EnrollmentCodeStatus.ACTIVE) {
      throw new BadRequestException('This enrollment code is no longer active')
    }
    if (new Date(code.expiresAt) < new Date()) {
      code.status = EnrollmentCodeStatus.EXPIRED
      await this.codesRepository.save(code)
      throw new BadRequestException('This enrollment code has expired')
    }
    if (code.currentUses >= code.maxUses) {
      throw new BadRequestException('This enrollment code has reached its usage limit')
    }

    code.currentUses += 1
    await this.codesRepository.save(code)

    // Link (or create) the roster row backing this student's account so
    // /home/student, assignments, and reports resolve for a self-signup
    // mobile student the same way they do for an admin-added one.
    let student = await this.studentsRepository.findOne({ where: { userId: user.id } })
    if (student) {
      student.schoolId = code.schoolId
      student.classId = code.classId
    } else {
      student = this.studentsRepository.create({
        schoolId: code.schoolId,
        classId: code.classId,
        userId: user.id,
        name: user.name,
        source: RosterSource.SELF_ENROLLED,
      })
    }
    await this.studentsRepository.save(student)
    await this.usersRepository.update(user.id, { schoolId: code.schoolId })

    return { classId: code.classId, redeemed: true }
  }
}
