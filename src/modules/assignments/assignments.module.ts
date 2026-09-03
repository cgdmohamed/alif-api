import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Assignment } from './assignment.entity'
import { Submission } from './submission.entity'
import { Student } from '../students/student.entity'
import { AssignmentsService } from './assignments.service'
import { AssignmentsController } from './assignments.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, Submission, Student])],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService, TypeOrmModule],
})
export class AssignmentsModule {}
