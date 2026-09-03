import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { Recording } from './recording.entity'
import type { UpdateRecordingDto } from './dto/update-recording.dto'

const TOTAL_STORAGE_BYTES = 1024 * 1024 * 1024 * 1024 // 1 TB, placeholder plan cap

@Injectable()
export class RecordingsService {
  constructor(
    @InjectRepository(Recording) private readonly recordingsRepository: Repository<Recording>,
  ) {}

  findAll(search?: string) {
    return this.recordingsRepository.find({
      where: search ? { title: ILike(`%${search}%`) } : {},
      order: { createdAt: 'DESC' },
    })
  }

  async update(id: string, dto: UpdateRecordingDto) {
    const recording = await this.recordingsRepository.findOne({ where: { id } })
    if (!recording) throw new NotFoundException('Recording not found')
    Object.assign(recording, dto)
    return this.recordingsRepository.save(recording)
  }

  async remove(id: string) {
    const recording = await this.recordingsRepository.findOne({ where: { id } })
    if (!recording) throw new NotFoundException('Recording not found')
    await this.recordingsRepository.remove(recording)
    return { id }
  }

  async storageUsage() {
    const { sum } = await this.recordingsRepository
      .createQueryBuilder('recording')
      .select('COALESCE(SUM(recording.sizeBytes), 0)', 'sum')
      .getRawOne<{ sum: string }>()
      .then((r) => ({ sum: r?.sum ?? '0' }))

    const usedBytes = Number(sum)
    return {
      usedBytes,
      totalBytes: TOTAL_STORAGE_BYTES,
      usedPercent: Math.round((usedBytes / TOTAL_STORAGE_BYTES) * 100),
    }
  }
}
