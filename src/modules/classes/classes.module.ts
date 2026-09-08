import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Class } from './class.entity'
import { ClassMeeting } from './class-meeting.entity'
import { Resource } from '../resources/resource.entity'
import { ClassesService } from './classes.service'
import { ClassesController } from './classes.controller'
import { MeetingsModule } from '../meetings/meetings.module'
import { PackagesModule } from '../packages/packages.module'
import { Teacher } from '../teachers/teacher.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Class, ClassMeeting, Resource, Teacher]), MeetingsModule, PackagesModule],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService, TypeOrmModule],
})
export class ClassesModule {}
