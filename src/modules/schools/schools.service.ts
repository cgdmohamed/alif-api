import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { School } from './school.entity'
import { SchoolInvoice } from './school-invoice.entity'
import { SchoolApproval } from './school-approval.entity'
import { PackagesService } from '../packages/packages.service'
import { ActivityLogService } from '../activity-log/activity-log.service'
import { ActivityTone } from '../activity-log/activity-log.entity'
import type { CreateSchoolDto } from './dto/create-school.dto'
import type { UpdateSchoolDto } from './dto/update-school.dto'
import type { SubscribeSchoolDto } from './dto/subscribe-school.dto'

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School) private readonly schoolsRepository: Repository<School>,
    @InjectRepository(SchoolInvoice) private readonly invoicesRepository: Repository<SchoolInvoice>,
    @InjectRepository(SchoolApproval) private readonly approvalsRepository: Repository<SchoolApproval>,
    private readonly packagesService: PackagesService,
    private readonly activityLog: ActivityLogService,
  ) {}

  findAll() {
    return this.schoolsRepository.find({ relations: ['contacts'], order: { createdAt: 'DESC' } })
  }

  async findOne(id: string) {
    const school = await this.schoolsRepository.findOne({
      where: { id },
      relations: ['contacts', 'approvals'],
    })
    if (!school) throw new NotFoundException('School not found')
    return school
  }

  async create(dto: CreateSchoolDto) {
    const school = this.schoolsRepository.create({
      name: dto.name,
      city: dto.city,
      type: dto.type,
      principal: dto.principal,
      packageId: dto.packageId ?? null,
      joinedAt: new Date().toISOString().slice(0, 10),
      contacts: dto.contacts?.map((c) => ({ ...c })),
    })
    const saved = await this.schoolsRepository.save(school)
    await this.activityLog.record({
      actorName: 'النظام',
      action: 'إضافة مدرسة',
      target: saved.name,
      tone: ActivityTone.SUCCESS,
    })
    return saved
  }

  async update(id: string, dto: UpdateSchoolDto) {
    const school = await this.findOne(id)
    const { contacts, ...rest } = dto
    Object.assign(school, rest)
    return this.schoolsRepository.save(school)
  }

  async subscribe(id: string, dto: SubscribeSchoolDto) {
    const school = await this.findOne(id)
    await this.packagesService.findOne(dto.packageId)
    school.packageId = dto.packageId
    return this.schoolsRepository.save(school)
  }

  async invoices(schoolId: string) {
    await this.findOne(schoolId)
    return this.invoicesRepository.find({ where: { schoolId }, order: { issuedAt: 'DESC' } })
  }

  async approvals(schoolId: string) {
    await this.findOne(schoolId)
    return this.approvalsRepository.find({ where: { schoolId }, order: { createdAt: 'DESC' } })
  }
}
