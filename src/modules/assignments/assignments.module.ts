import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Assignment } from './assignment.entity'
import { Submission } from './submission.entity'
import { Student } from '../students/student.entity'
import { AssignmentsService } from './assignments.service'
import { AssignmentsController } from './assignments.controller'
import { Class } from '../classes/class.entity'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, Submission, Student, Class]), NotificationsModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService, TypeOrmModule],
})
export class AssignmentsModule {}
