import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ContentItem, ContentItemType } from './content-item.entity'
import { STORAGE_PROVIDER, type StorageProvider } from '../../common/storage/storage-provider.interface'
import type { CreateContentItemDto } from './dto/create-content-item.dto'

@Injectable()
export class ContentLibraryService {
  constructor(
    @InjectRepository(ContentItem)
    private readonly itemsRepository: Repository<ContentItem>,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  findAll(filters: { folder?: string; type?: ContentItemType } = {}) {
    return this.itemsRepository.find({
      where: filters,
      order: { createdAt: 'DESC' },
    })
  }

  async create(dto: CreateContentItemDto, file: { buffer: Buffer; originalname: string; size: number }) {
    if (!file) throw new BadRequestException('A file is required')
    const maxBytes = Number(process.env.MAX_UPLOAD_BYTES ?? 25 * 1024 * 1024)
    if (file.size > maxBytes) throw new BadRequestException(`File exceeds the ${maxBytes} byte upload limit`)
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    const key = `content/${Date.now()}-${safeName}`
    const storageUrl = await this.storage.save(key, file.buffer)
    return this.itemsRepository.save(this.itemsRepository.create({ ...dto, storageUrl, sizeBytes: file.size }))
  }

  async remove(id: string) {
    const item = await this.itemsRepository.findOne({ where: { id } })
    if (!item) throw new NotFoundException('Content item not found')
    if (item.storageUrl.startsWith('/uploads/')) {
      await this.storage.delete(item.storageUrl.slice('/uploads/'.length))
    }
    await this.itemsRepository.remove(item)
    return { id }
  }
}
