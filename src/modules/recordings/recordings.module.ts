import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Recording } from './recording.entity'
import { RecordingsService } from './recordings.service'
import { RecordingsController } from './recordings.controller'
import { School } from '../schools/school.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Recording, School])],
  controllers: [RecordingsController],
  providers: [RecordingsService],
  exports: [RecordingsService, TypeOrmModule],
})
export class RecordingsModule {}
