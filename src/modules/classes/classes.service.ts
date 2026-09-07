import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Class, ClassStatus } from './class.entity'
import { ClassMeeting } from './class-meeting.entity'
import { Resource } from '../resources/resource.entity'
import type { CreateClassDto } from './dto/create-class.dto'
import type { UpdateClassDto } from './dto/update-class.dto'
import type { AddMeetingDto } from './dto/add-meeting.dto'

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class) private readonly classesRepository: Repository<Class>,
    @InjectRepository(ClassMeeting) private readonly meetingsRepository: Repository<ClassMeeting>,
    @InjectRepository(Resource) private readonly resourcesRepository: Repository<Resource>,
  ) {}

  findAllForSchool(schoolId: string) {
    return this.classesRepository.find({
      where: { schoolId },
      relations: ['meetings'],
      order: { createdAt: 'DESC' },
    })
  }

  findAll() {
    return this.classesRepository.find({
      relations: ['meetings', 'school'],
      order: { createdAt: 'DESC' },
    })
  }

  async findOne(id: string) {
    const classEntity = await this.classesRepository.findOne({
      where: { id },
      relations: ['meetings'],
    })
    if (!classEntity) throw new NotFoundException('Class not found')
    return classEntity
  }

  async create(schoolId: string, dto: CreateClassDto) {
    const resource = dto.resourceId
      ? await this.resourcesRepository.findOne({ where: { id: dto.resourceId } })
      : null
    const classEntity = this.classesRepository.create({
      schoolId,
      name: dto.name,
      resourceId: dto.resourceId ?? null,
      resourceVersionAtGeneration: resource?.versionNumber ?? null,
      teacherId: dto.teacherId ?? null,
      color: dto.color,
      autoAgora: dto.autoAgora,
      status: ClassStatus.ACTIVE,
      meetings: dto.initialMeetings?.map((m) => this.meetingsRepository.create(m)),
    })
    return this.classesRepository.save(classEntity)
  }

  async update(id: string, dto: UpdateClassDto) {
    const classEntity = await this.findOne(id)
    const { initialMeetings, ...rest } = dto
    Object.assign(classEntity, rest)
    return this.classesRepository.save(classEntity)
  }

  async addMeeting(classId: string, dto: AddMeetingDto) {
    await this.findOne(classId)
    return this.meetingsRepository.save(this.meetingsRepository.create({ classId, ...dto }))
  }
}
