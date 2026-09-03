import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Teacher } from './teacher.entity'
import { TeachersService } from './teachers.service'
import { TeachersController } from './teachers.controller'
import { Class } from '../classes/class.entity'
import { User } from '../users/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Class, User])],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService, TypeOrmModule],
})
export class TeachersModule {}
