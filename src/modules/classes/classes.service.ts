import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Class, ClassStatus } from './class.entity'
import { ClassMeeting } from './class-meeting.entity'
import { Resource } from '../resources/resource.entity'
import { MeetingsService } from '../meetings/meetings.service'
import type { CreateClassDto } from './dto/create-class.dto'
import type { UpdateClassDto } from './dto/update-class.dto'
import type { AddMeetingDto } from './dto/add-meeting.dto'
import { assertSchoolAccess, type AuthUser } from '../../common/authz/school-access'

// AddMeetingDto/InitialMeetingDto only take a date+time, no duration — this
// is the same default every other "schedule a live meeting" entry point in
// the app uses (see admin's StartSessionModal/TeacherClasses "start now").
const DEFAULT_MEETING_DURATION_MINUTES = 60

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class) private readonly classesRepository: Repository<Class>,
    @InjectRepository(ClassMeeting) private readonly meetingsRepository: Repository<ClassMeeting>,
    @InjectRepository(Resource) private readonly resourcesRepository: Repository<Resource>,
    private readonly meetingsService: MeetingsService,
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

  async findOneForUser(id: string, user: AuthUser) {
    const classEntity = await this.findOne(id)
    assertSchoolAccess(user, classEntity.schoolId)
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
    })
    const saved = await this.classesRepository.save(classEntity)
    for (const m of dto.initialMeetings ?? []) {
      await this.addMeeting(saved.id, m)
    }
    return this.findOne(saved.id)
  }

  async update(id: string, dto: UpdateClassDto, user?: AuthUser) {
    const classEntity = await this.findOne(id)
    if (user) assertSchoolAccess(user, classEntity.schoolId)
    const { initialMeetings, ...rest } = dto
    Object.assign(classEntity, rest)
    return this.classesRepository.save(classEntity)
  }

  async addMeeting(classId: string, dto: AddMeetingDto, user?: AuthUser) {
    const classEntity = await this.findOne(classId)
    if (user) assertSchoolAccess(user, classEntity.schoolId)
    // Every class meeting is backed by a real, joinable Meeting (Agora
    // channel + all the /meetings endpoints) rather than being just a
    // date/time row — see class-meeting.entity.ts's meetingId link.
    const meeting = await this.meetingsService.create({
      classId,
      title: dto.title,
      scheduledAt: new Date(`${dto.date}T${dto.time}:00`).toISOString(),
      durationMinutes: DEFAULT_MEETING_DURATION_MINUTES,
    })
    return this.meetingsRepository.save(
      this.meetingsRepository.create({ classId, title: dto.title, date: dto.date, time: dto.time, meetingId: meeting.id }),
    )
  }
}
