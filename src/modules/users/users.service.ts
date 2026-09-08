import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from './user.entity'
import type { CreateUserDto } from './dto/create-user.dto'
import type { UpdateUserDto } from './dto/update-user.dto'
import type { Role } from '../../common/enums/role.enum'
import { Role as UserRole } from '../../common/enums/role.enum'
import { Teacher } from '../teachers/teacher.entity'
import { Student } from '../students/student.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  findAll(filters: { role?: Role; schoolId?: string } = {}) {
    return this.usersRepository.find({
      where: filters,
      order: { createdAt: 'DESC' },
    })
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'passwordHash',
        'role',
        'schoolId',
        'status',
        'failedLoginAttempts',
        'lockedUntil',
      ],
    })
  }

  findByPhone(phone: string) {
    return this.usersRepository.findOne({ where: { phone } })
  }

  async create(dto: CreateUserDto) {
    if (dto.email && (await this.usersRepository.exists({ where: { email: dto.email } }))) {
      throw new ConflictException('A user with this email already exists')
    }
    if (dto.phone && (await this.usersRepository.exists({ where: { phone: dto.phone } }))) {
      throw new ConflictException('A user with this phone number already exists')
    }

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : null

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      passwordHash,
      role: dto.role,
      schoolId: dto.schoolId ?? null,
    })
    return this.usersRepository.manager.transaction(async (manager) => {
      const saved = await manager.save(user)
      if (saved.email && saved.schoolId && saved.role === UserRole.TEACHER) {
        const teacher = await manager.findOne(Teacher, {
          where: { email: saved.email, schoolId: saved.schoolId },
        })
        if (teacher) {
          teacher.userId = saved.id
          await manager.save(teacher)
        }
      }
      if (saved.email && saved.schoolId && saved.role === UserRole.STUDENT) {
        const student = await manager.findOne(Student, {
          where: { studentEmail: saved.email, schoolId: saved.schoolId },
        })
        if (student) {
          student.userId = saved.id
          await manager.save(student)
        }
      }
      return saved
    })
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id)
    const { password, ...rest } = dto
    Object.assign(user, rest)
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10)
    }
    return this.usersRepository.save(user)
  }

  async remove(id: string) {
    const user = await this.findOne(id)
    await this.usersRepository.remove(user)
    return { id }
  }

  async touchLastLogin(id: string) {
    await this.usersRepository.update(id, { lastLoginAt: new Date() })
  }
}
