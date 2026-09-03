import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, Repository } from 'typeorm'
import { Meeting, MeetingStatus } from './meeting.entity'
import { ContentBlock } from '../programs/content-block.entity'
import { Recording } from '../recordings/recording.entity'
import { ZOOM_PROVIDER, type ZoomProvider, type ZoomRole } from './providers/zoom-provider.interface'
import { Role } from '../../common/enums/role.enum'
import type { CreateMeetingDto } from './dto/create-meeting.dto'
import type { UpdateMeetingDto } from './dto/update-meeting.dto'
import type { CompleteMeetingDto } from './dto/complete-meeting.dto'

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
    @Inject(ZOOM_PROVIDER) private readonly zoomProvider: ZoomProvider,
  ) {}

  findByScope(scope?: MeetingScope) {
    if (!scope) return this.meetingsRepository.find({ order: { scheduledAt: 'ASC' } })
    const [start, end] = scopeRange(scope)
    return this.meetingsRepository.find({
      where: { scheduledAt: Between(start, end) },
      order: { scheduledAt: 'ASC' },
    })
  }

  async findOne(id: string) {
    const meeting = await this.meetingsRepository.findOne({ where: { id } })
    if (!meeting) throw new NotFoundException('Meeting not found')
    return meeting
  }

  async create(dto: CreateMeetingDto) {
    const meeting = this.meetingsRepository.create({
      classId: dto.classId,
      title: dto.title,
      scheduledAt: new Date(dto.scheduledAt),
      durationMinutes: dto.durationMinutes,
      sessionPlanBlockIds: dto.sessionPlanBlockIds ?? [],
    })
    const saved = await this.meetingsRepository.save(meeting)
    const zoom = await this.zoomProvider.createSession(dto.title, saved.id)
    saved.zoomSessionName = zoom.sessionName
    return this.meetingsRepository.save(saved)
  }

  async update(id: string, dto: UpdateMeetingDto) {
    const meeting = await this.findOne(id)
    const { scheduledAt, ...rest } = dto
    Object.assign(meeting, rest)
    if (scheduledAt) meeting.scheduledAt = new Date(scheduledAt)
    return this.meetingsRepository.save(meeting)
  }

  async join(id: string, user: { id: string; role: Role }) {
    const meeting = await this.findOne(id)
    if (!meeting.zoomSessionName) {
      const zoom = await this.zoomProvider.createSession(meeting.title, meeting.id)
      meeting.zoomSessionName = zoom.sessionName
    }
    if (meeting.status === MeetingStatus.SCHEDULED) {
      meeting.status = MeetingStatus.LIVE
    }
    await this.meetingsRepository.save(meeting)

    const zoomRole: ZoomRole = user.role === Role.TEACHER ? 'host' : 'participant'
    return this.zoomProvider.generateJoinToken(meeting.zoomSessionName, zoomRole, user.id)
  }

  async sessionPlan(id: string) {
    const meeting = await this.findOne(id)
    if (meeting.sessionPlanBlockIds.length === 0) return []
    return this.blocksRepository
      .createQueryBuilder('block')
      .where('block.id IN (:...ids)', { ids: meeting.sessionPlanBlockIds })
      .getMany()
  }

  async pushActivity(id: string, blockId: string) {
    const meeting = await this.findOne(id)
    meeting.pushedActivityBlockId = blockId
    return this.meetingsRepository.save(meeting)
  }

  async complete(id: string, dto: CompleteMeetingDto) {
    const meeting = await this.findOne(id)
    meeting.status = MeetingStatus.ENDED
    meeting.completedAt = new Date()
    meeting.completionChecklist = dto.checklist
    meeting.completionRating = dto.rating
    meeting.completionNote = dto.note ?? null
    await this.meetingsRepository.save(meeting)

    if (meeting.zoomSessionName) {
      const playbackUrl = await this.zoomProvider.getRecordingUrl(meeting.zoomSessionName)
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

  async recording(id: string) {
    const recording = await this.recordingsRepository.findOne({ where: { meetingId: id } })
    if (!recording) throw new NotFoundException('No recording available for this meeting yet')
    return recording
  }
}
