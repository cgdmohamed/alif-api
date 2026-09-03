import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AutoMessageTemplate } from './auto-message-template.entity'
import type { UpdateTemplateDto } from './dto/update-template.dto'

@Injectable()
export class AutoMessagesService {
  constructor(
    @InjectRepository(AutoMessageTemplate)
    private readonly templatesRepository: Repository<AutoMessageTemplate>,
  ) {}

  findAll() {
    return this.templatesRepository.find()
  }

  async update(id: string, dto: UpdateTemplateDto) {
    const template = await this.templatesRepository.findOne({ where: { id } })
    if (!template) throw new NotFoundException('Template not found')
    Object.assign(template, dto)
    return this.templatesRepository.save(template)
  }
}
