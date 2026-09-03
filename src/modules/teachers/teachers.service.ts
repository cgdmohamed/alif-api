import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Teacher, TeacherStatus, RosterSource } from './teacher.entity'
import { Class } from '../classes/class.entity'
import { User } from '../users/user.entity'
import type { CreateTeacherDto } from './dto/create-teacher.dto'

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher) private readonly teachersRepository: Repository<Teacher>,
    @InjectRepository(Class) private readonly classesRepository: Repository<Class>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  findAllForSchool(schoolId: string) {
    return this.teachersRepository.find({ where: { schoolId }, order: { createdAt: 'DESC' } })
  }

  create(schoolId: string, dto: CreateTeacherDto) {
    return this.teachersRepository.save(
      this.teachersRepository.create({ ...dto, schoolId, source: RosterSource.MANUAL }),
    )
  }

  createBulk(schoolId: string, dtos: CreateTeacherDto[]) {
    const entities = dtos.map((dto) =>
      this.teachersRepository.create({ ...dto, schoolId, source: RosterSource.CSV }),
    )
    return this.teachersRepository.save(entities)
  }

  async toggleStatus(id: string) {
    const teacher = await this.teachersRepository.findOne({ where: { id } })
    if (!teacher) throw new NotFoundException('Teacher not found')
    teacher.status = teacher.status === TeacherStatus.ACTIVE ? TeacherStatus.DISABLED : TeacherStatus.ACTIVE
    return this.teachersRepository.save(teacher)
  }

  async remove(id: string) {
    const teacher = await this.teachersRepository.findOne({ where: { id } })
    if (!teacher) throw new NotFoundException('Teacher not found')
    await this.teachersRepository.remove(teacher)
    return { id }
  }

  /**
   * Resolves the logged-in user to their school-roster Teacher record via
   * email (Teacher rows aren't formally linked to a User account yet — see
   * Teacher.userId doc comment) and returns that teacher's classes.
   */
  async myClasses(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user?.email) return []
    const teacher = await this.teachersRepository.findOne({ where: { email: user.email } })
    if (!teacher) return []
    return this.classesRepository.find({
      where: { teacherId: teacher.id },
      relations: ['meetings'],
      order: { createdAt: 'DESC' },
    })
  }

  async myProfile(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user?.email) return null
    return this.teachersRepository.findOne({ where: { email: user.email } })
  }
}
