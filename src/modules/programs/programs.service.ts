import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProgramDay } from './program-day.entity'
import { Unit } from './unit.entity'
import { SessionNode } from './session-node.entity'
import { ContentBlock } from './content-block.entity'
import type { CreateDayDto } from './dto/create-day.dto'
import type { CreateUnitDto } from './dto/create-unit.dto'
import type { CreateSessionDto } from './dto/create-session.dto'
import type { CreateBlockDto } from './dto/create-block.dto'
import type { UpdateBlockDto } from './dto/update-block.dto'

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(ProgramDay) private readonly daysRepository: Repository<ProgramDay>,
    @InjectRepository(Unit) private readonly unitsRepository: Repository<Unit>,
    @InjectRepository(SessionNode) private readonly sessionsRepository: Repository<SessionNode>,
    @InjectRepository(ContentBlock) private readonly blocksRepository: Repository<ContentBlock>,
  ) {}

  async getTree(resourceId: string) {
    const days = await this.daysRepository.find({ where: { resourceId }, order: { dayNumber: 'ASC' } })
    const dayIds = days.map((d) => d.id)
    const units = dayIds.length
      ? await this.unitsRepository
          .createQueryBuilder('unit')
          .where('unit.dayId IN (:...dayIds)', { dayIds })
          .orderBy('unit.unitNumber', 'ASC')
          .getMany()
      : []
    const unitIds = units.map((u) => u.id)
    const sessions = unitIds.length
      ? await this.sessionsRepository
          .createQueryBuilder('session')
          .where('session.unitId IN (:...unitIds)', { unitIds })
          .orderBy('session.sessionNumber', 'ASC')
          .getMany()
      : []
    const sessionIds = sessions.map((s) => s.id)
    const blocks = sessionIds.length
      ? await this.blocksRepository
          .createQueryBuilder('block')
          .where('block.sessionId IN (:...sessionIds)', { sessionIds })
          .orderBy('block.position', 'ASC')
          .getMany()
      : []

    return { days, units, sessions, blocks }
  }

  async addDay(resourceId: string, dto: CreateDayDto) {
    const count = await this.daysRepository.count({ where: { resourceId } })
    return this.daysRepository.save(
      this.daysRepository.create({ resourceId, title: dto.title, dayNumber: count + 1 }),
    )
  }

  async addUnit(dayId: string, dto: CreateUnitDto) {
    const count = await this.unitsRepository.count({ where: { dayId } })
    return this.unitsRepository.save(
      this.unitsRepository.create({ dayId, title: dto.title, unitNumber: count + 1 }),
    )
  }

  async addSession(unitId: string, dto: CreateSessionDto) {
    const count = await this.sessionsRepository.count({ where: { unitId } })
    return this.sessionsRepository.save(
      this.sessionsRepository.create({
        unitId,
        title: dto.title,
        durationMinutes: dto.durationMinutes,
        sessionNumber: count + 1,
      }),
    )
  }

  async addBlock(sessionId: string, dto: CreateBlockDto) {
    const count = await this.blocksRepository.count({ where: { sessionId } })
    return this.blocksRepository.save(
      this.blocksRepository.create({
        sessionId,
        position: count,
        type: dto.type,
        title: dto.title,
        durationMinutes: dto.durationMinutes,
        executionMode: dto.executionMode ?? null,
        deliveryChannel: dto.deliveryChannel ?? null,
        activityType: dto.activityType ?? null,
        instructionsText: dto.instructionsText ?? null,
        materialsNeeded: dto.materialsNeeded ?? null,
        trainerNotes: dto.trainerNotes ?? null,
      }),
    )
  }

  async updateDay(id: string, dto: CreateDayDto) {
    const day = await this.daysRepository.findOne({ where: { id } })
    if (!day) throw new NotFoundException('Day not found')
    day.title = dto.title
    return this.daysRepository.save(day)
  }

  async updateUnit(id: string, dto: CreateUnitDto) {
    const unit = await this.unitsRepository.findOne({ where: { id } })
    if (!unit) throw new NotFoundException('Unit not found')
    unit.title = dto.title
    return this.unitsRepository.save(unit)
  }

  async updateSession(id: string, dto: CreateSessionDto) {
    const session = await this.sessionsRepository.findOne({ where: { id } })
    if (!session) throw new NotFoundException('Session not found')
    session.title = dto.title
    session.durationMinutes = dto.durationMinutes
    return this.sessionsRepository.save(session)
  }

  async updateBlock(id: string, dto: UpdateBlockDto) {
    const block = await this.blocksRepository.findOne({ where: { id } })
    if (!block) throw new NotFoundException('Block not found')
    Object.assign(block, dto)
    return this.blocksRepository.save(block)
  }

  async removeBlock(id: string) {
    const block = await this.blocksRepository.findOne({ where: { id } })
    if (!block) throw new NotFoundException('Block not found')
    await this.blocksRepository.remove(block)
    return { id }
  }
}
