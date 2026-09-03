import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Class } from './class.entity'
import { ClassMeeting } from './class-meeting.entity'
import { Resource } from '../resources/resource.entity'
import { ClassesService } from './classes.service'
import { ClassesController } from './classes.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Class, ClassMeeting, Resource])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService, TypeOrmModule],
})
export class ClassesModule {}
