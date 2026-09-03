import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from './user.entity'
import type { CreateUserDto } from './dto/create-user.dto'
import type { UpdateUserDto } from './dto/update-user.dto'
import type { Role } from '../../common/enums/role.enum'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(filters: { role?: Role; schoolId?: string } = {}) {
    return this.usersRepository.find({ where: filters, order: { createdAt: 'DESC' } })
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
    return this.usersRepository.save(user)
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
