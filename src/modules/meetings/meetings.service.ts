import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, Repository } from 'typeorm'
import { Meeting, MeetingStatus } from './meeting.entity'
import { ContentBlock } from '../programs/content-block.entity'
import { Recording } from '../recordings/recording.entity'
import { AGORA_PROVIDER, type AgoraProvider } from './providers/agora-provider.interface'
import type { CreateMeetingDto } from './dto/create-meeting.dto'
import type { UpdateMeetingDto } from './dto/update-meeting.dto'
import type { CompleteMeetingDto } from './dto/complete-meeting.dto'
import { Student } from '../students/student.entity'
import { Role } from '../../common/enums/role.enum'
import { assertSchoolAccess, type AuthUser } from '../../common/authz/school-access'
import { Class } from '../classes/class.entity'

export type MeetingScope = 'today' | 'week' | 'month'

function scopeRange(scope: MeetingScope): [Date, Date] {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  if (scope === 'today') end.setDate(end.getDate() + 1)
  if (scope === 'week') end.setDate(end.getDate() + 7)
  if (scope === 'month') end.setMonth(end.getMonth() + 1)
  return [start, end]
}

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting) private readonly meetingsRepository: Repository<Meeting>,
    @InjectRepository(ContentBlock) private readonly blocksRepository: Repository<ContentBlock>,
    @InjectRepository(Recording) private readonly recordingsRepository: Repository<Recording>,
    @InjectRepository(Student) private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Class) private readonly classesRepository: Repository<Class>,
    @Inject(AGORA_PROVIDER) private readonly agoraProvider: AgoraProvider,
  ) {}

  async findByScope(user: AuthUser, scope?: MeetingScope) {
    const meetings = scope
      ? await this.meetingsRepository.find({ where: { scheduledAt: Between(...scopeRange(scope)) }, order: { scheduledAt: 'ASC' } })
      : await this.meetingsRepository.find({ order: { scheduledAt: 'ASC' } })
    const allowed = await Promise.all(meetings.map(async (meeting) => (await this.canAccess(meeting, user)) ? meeting : null))
    return allowed.filter((meeting): meeting is Meeting => meeting !== null)
  }

  async findOne(id: string) {
    const meeting = await this.meetingsRepository.findOne({ where: { id } })
    if (!meeting) throw new NotFoundException('Meeting not found')
    return meeting
  }

  private async canAccess(meeting: Meeting, user: AuthUser) {
    if (user.role === Role.PLATFORM_ADMIN) return true
    if (user.role === Role.SCHOOL_ADMIN || user.role === Role.TEACHER) {
      return Boolean(user.schoolId && meeting.classEntity.schoolId === user.schoolId)
    }
    if (user.role === Role.STUDENT) {
      return this.studentsRepository.exists({ where: { userId: user.id, classId: meeting.classId } })
    }
    if (user.role === Role.PARENT) {
      return this.studentsRepository.exists({ where: { parentUserId: user.id, classId: meeting.classId } })
    }
    return false
  }

  private async assertAccess(meeting: Meeting, user: AuthUser) {
    if (!(await this.canAccess(meeting, user))) throw new ForbiddenException('You do not have access to this meeting')
  }

  async findOneForUser(id: string, user: AuthUser) {
    const meeting = await this.findOne(id)
    await this.assertAccess(meeting, user)
    return meeting
  }

  async create(dto: CreateMeetingDto, user?: AuthUser) {
    const classEntity = await this.classesRepository.findOne({ where: { id: dto.classId } })
    if (!classEntity) throw new NotFoundException('Class not found')
    if (user) assertSchoolAccess(user, classEntity.schoolId)
    const meeting = this.meetingsRepository.create({
      classId: dto.classId,
      title: dto.title,
      scheduledAt: new Date(dto.scheduledAt),
      durationMinutes: dto.durationMinutes,
      sessionPlanBlockIds: dto.sessionPlanBlockIds ?? [],
    })
    const saved = await this.meetingsRepository.save(meeting)
    const agora = await this.agoraProvider.createSession(dto.title, saved.id)
    saved.agoraChannelName = agora.channelName
    return this.meetingsRepository.save(saved)
  }

  async update(id: string, dto: UpdateMeetingDto, user: AuthUser) {
    const meeting = await this.findOne(id)
    await this.assertAccess(meeting, user)
    const { scheduledAt, ...rest } = dto
    Object.assign(meeting, rest)
    if (scheduledAt) meeting.scheduledAt = new Date(scheduledAt)
    return this.meetingsRepository.save(meeting)
  }

  async join(id: string, user: AuthUser) {
    const meeting = await this.findOne(id)
    await this.assertAccess(meeting, user)
    if (!meeting.agoraChannelName) {
      const agora = await this.agoraProvider.createSession(meeting.title, meeting.id)
      meeting.agoraChannelName = agora.channelName
    }
    if (meeting.status === MeetingStatus.SCHEDULED) {
      meeting.status = MeetingStatus.LIVE
    }
    await this.meetingsRepository.save(meeting)

    return this.agoraProvider.generateJoinToken(meeting.agoraChannelName)
  }

  async sessionPlan(id: string, user: AuthUser) {
    const meeting = await this.findOne(id)
    await this.assertAccess(meeting, user)
    if (meeting.sessionPlanBlockIds.length === 0) return []
    return this.blocksRepository
      .createQueryBuilder('block')
      .where('block.id IN (:...ids)', { ids: meeting.sessionPlanBlockIds })
      .getMany()
  }

  async pushActivity(id: string, blockId: string, user: AuthUser) {
    const meeting = await this.findOne(id)
    await this.assertAccess(meeting, user)
    meeting.pushedActivityBlockId = blockId
    return this.meetingsRepository.save(meeting)
  }

  async complete(id: string, dto: CompleteMeetingDto, user: AuthUser) {
    const meeting = await this.findOne(id)
    await this.assertAccess(meeting, user)
    meeting.status = MeetingStatus.ENDED
    meeting.completedAt = new Date()
    meeting.completionChecklist = dto.checklist
    meeting.completionRating = dto.rating
    meeting.completionNote = dto.note ?? null
    await this.meetingsRepository.save(meeting)

    if (meeting.agoraChannelName) {
      const playbackUrl = await this.agoraProvider.getRecordingUrl(meeting.agoraChannelName)
      if (playbackUrl) {
        await this.recordingsRepository.save(
          this.recordingsRepository.create({
            meetingId: meeting.id,
            title: meeting.title,
            playbackUrl,
          }),
        )
      }
    }

    return meeting
  }

  async recording(id: string, user: AuthUser) {
    await this.findOneForUser(id, user)
    const recording = await this.recordingsRepository.findOne({ where: { meetingId: id } })
    if (!recording) throw new NotFoundException('No recording available for this meeting yet')
    return recording
  }
}
