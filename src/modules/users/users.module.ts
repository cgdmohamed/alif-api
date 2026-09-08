import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './user.entity'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { Teacher } from '../teachers/teacher.entity'
import { Student } from '../students/student.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Teacher, Student])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
