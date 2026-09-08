import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EnrollmentCode } from './enrollment-code.entity'
import { Student } from '../students/student.entity'
import { User } from '../users/user.entity'
import { Class } from '../classes/class.entity'
import { EnrollmentCodesService } from './enrollment-codes.service'
import { EnrollmentCodesController } from './enrollment-codes.controller'

@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentCode, Student, User, Class])],
  controllers: [EnrollmentCodesController],
  providers: [EnrollmentCodesService],
  exports: [EnrollmentCodesService],
})
export class EnrollmentCodesModule {}
