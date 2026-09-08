import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Student } from './student.entity'
import { RosterSource } from '../teachers/teacher.entity'
import { Class } from '../classes/class.entity'
import type { CreateStudentDto } from './dto/create-student.dto'
import { assertSchoolAccess, type AuthUser } from '../../common/authz/school-access'
import { PackagesService } from '../packages/packages.service'
import { User } from '../users/user.entity'
import { Role } from '../../common/enums/role.enum'

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Class)
    private readonly classesRepository: Repository<Class>,
    private readonly packagesService: PackagesService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  private async resolveClassId(schoolId: string, className: string) {
    const match = await this.classesRepository.findOne({
      where: { schoolId, name: className },
    })
    return match?.id ?? null
  }

  async findAllForSchool(schoolId: string) {
    const students = await this.studentsRepository.find({
      where: { schoolId },
      order: { createdAt: 'DESC' },
    })
    const classes = await this.classesRepository.find({ where: { schoolId } })
    const classNameById = new Map(classes.map((c) => [c.id, c.name]))
    return students.map((s) => ({
      ...s,
      className: s.classId ? (classNameById.get(s.classId) ?? null) : null,
    }))
  }

  async create(schoolId: string, dto: CreateStudentDto) {
    const classId = await this.resolveClassId(schoolId, dto.className)
    if (!classId) throw new BadRequestException('Class does not exist in this school')
    const current = await this.studentsRepository.count({
      where: { schoolId },
    })
    await this.packagesService.assertCapacity(schoolId, 'students', 1, current)
    const linkedUser = await this.usersRepository.findOne({
      where: { email: dto.studentEmail, schoolId, role: Role.STUDENT },
    })
    return this.studentsRepository.save(
      this.studentsRepository.create({
        schoolId,
        userId: linkedUser?.id ?? null,
        classId,
        name: dto.name,
        stage: dto.stage ?? 'غير محدد',
        parentName: dto.parentName,
        parentEmail: dto.parentEmail,
        studentEmail: dto.studentEmail,
        source: RosterSource.MANUAL,
      }),
    )
  }

  async createBulk(schoolId: string, dtos: CreateStudentDto[]) {
    const current = await this.studentsRepository.count({
      where: { schoolId },
    })
    await this.packagesService.assertCapacity(schoolId, 'students', dtos.length, current)
    const entities = await Promise.all(
      dtos.map(async (dto) => {
        const classId = await this.resolveClassId(schoolId, dto.className)
        if (!classId) throw new BadRequestException(`Class "${dto.className}" does not exist in this school`)
        const linkedUser = await this.usersRepository.findOne({
          where: { email: dto.studentEmail, schoolId, role: Role.STUDENT },
        })
        return this.studentsRepository.create({
          schoolId,
          userId: linkedUser?.id ?? null,
          classId,
          name: dto.name,
          stage: dto.stage ?? 'غير محدد',
          parentName: dto.parentName,
          parentEmail: dto.parentEmail,
          studentEmail: dto.studentEmail,
          source: RosterSource.CSV,
        })
      }),
    )
    return this.studentsRepository.save(entities)
  }

  async remove(id: string, user: AuthUser) {
    const student = await this.studentsRepository.findOne({ where: { id } })
    if (!student) throw new NotFoundException('Student not found')
    assertSchoolAccess(user, student.schoolId)
    await this.studentsRepository.remove(student)
    return { id }
  }
}
