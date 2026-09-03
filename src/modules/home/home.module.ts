import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Student } from '../students/student.entity'
import { Meeting } from '../meetings/meeting.entity'
import { Assignment } from '../assignments/assignment.entity'
import { Submission } from '../assignments/submission.entity'
import { Notification } from '../notifications/notification.entity'
import { HomeService } from './home.service'
import { HomeController } from './home.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Student, Meeting, Assignment, Submission, Notification])],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
