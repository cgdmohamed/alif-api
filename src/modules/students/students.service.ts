import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Student } from './student.entity'
import { RosterSource } from '../teachers/teacher.entity'
import { Class } from '../classes/class.entity'
import type { CreateStudentDto } from './dto/create-student.dto'

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Class) private readonly classesRepository: Repository<Class>,
  ) {}

  private async resolveClassId(schoolId: string, className: string) {
    const match = await this.classesRepository.findOne({ where: { schoolId, name: className } })
    return match?.id ?? null
  }

  async findAllForSchool(schoolId: string) {
    const students = await this.studentsRepository.find({ where: { schoolId }, order: { createdAt: 'DESC' } })
    const classes = await this.classesRepository.find({ where: { schoolId } })
    const classNameById = new Map(classes.map((c) => [c.id, c.name]))
    return students.map((s) => ({ ...s, className: s.classId ? classNameById.get(s.classId) ?? null : null }))
  }

  async create(schoolId: string, dto: CreateStudentDto) {
    const classId = await this.resolveClassId(schoolId, dto.className)
    return this.studentsRepository.save(
      this.studentsRepository.create({
        schoolId,
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
    const entities = await Promise.all(
      dtos.map(async (dto) => {
        const classId = await this.resolveClassId(schoolId, dto.className)
        return this.studentsRepository.create({
          schoolId,
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

  async remove(id: string) {
    const student = await this.studentsRepository.findOne({ where: { id } })
    if (!student) throw new NotFoundException('Student not found')
    await this.studentsRepository.remove(student)
    return { id }
  }
}
