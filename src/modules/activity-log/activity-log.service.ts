import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ActivityLogEntry, ActivityTone } from './activity-log.entity'

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLogEntry)
    private readonly logRepository: Repository<ActivityLogEntry>,
  ) {}

  findAll(limit = 100) {
    return this.logRepository.find({ order: { createdAt: 'DESC' }, take: limit })
  }

  record(entry: {
    actorName: string
    actorUserId?: string | null
    action: string
    target: string
    ip?: string | null
    tone?: ActivityTone
  }) {
    return this.logRepository.save(this.logRepository.create(entry))
  }
}
