import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ActivityLogEntry } from './activity-log.entity'
import { ActivityLogService } from './activity-log.service'
import { ActivityLogController } from './activity-log.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLogEntry])],
  controllers: [ActivityLogController],
  providers: [ActivityLogService],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
