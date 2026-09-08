import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Public } from '../../common/decorators/public.decorator'
import { DataSource } from 'typeorm'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  async check() {
    try {
      await this.dataSource.query('SELECT 1')
      return { status: 'ok', database: 'up', timestamp: new Date().toISOString() }
    } catch {
      throw new ServiceUnavailableException('Database is unavailable')
    }
  }
}
