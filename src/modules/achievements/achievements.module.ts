import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Badge } from './badge.entity'
import { StudentBadge } from './student-badge.entity'
import { Student } from '../students/student.entity'
import { AchievementsService } from './achievements.service'
import { AchievementsController } from './achievements.controller'
import { Class } from '../classes/class.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Badge, StudentBadge, Student, Class])],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService, TypeOrmModule],
})
export class AchievementsModule {}
