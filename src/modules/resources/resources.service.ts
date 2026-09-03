import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Resource, ResourceStatus } from './resource.entity'
import type { CreateResourceDto } from './dto/create-resource.dto'
import type { UpdateResourceDto } from './dto/update-resource.dto'

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource) private readonly resourcesRepository: Repository<Resource>,
  ) {}

  findAll(filters: { status?: ResourceStatus } = {}) {
    return this.resourcesRepository.find({ where: filters, order: { createdAt: 'DESC' } })
  }

  async findOne(id: string) {
    const resource = await this.resourcesRepository.findOne({ where: { id } })
    if (!resource) throw new NotFoundException('Resource not found')
    return resource
  }

  create(dto: CreateResourceDto) {
    return this.resourcesRepository.save(this.resourcesRepository.create(dto))
  }

  async update(id: string, dto: UpdateResourceDto) {
    const resource = await this.findOne(id)
    Object.assign(resource, dto)
    return this.resourcesRepository.save(resource)
  }
}
