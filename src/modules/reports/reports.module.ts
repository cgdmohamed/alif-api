import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Student } from '../students/student.entity'
import { Class } from '../classes/class.entity'
import { Submission } from '../assignments/submission.entity'
import { AttendanceRecord } from './attendance.entity'
import { ReportsService } from './reports.service'
import { ReportsController } from './reports.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Student, Class, Submission, AttendanceRecord])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService, TypeOrmModule],
})
export class ReportsModule {}
