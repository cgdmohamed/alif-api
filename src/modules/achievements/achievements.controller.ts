import { Controller, Get, Param } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AchievementsService } from './achievements.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('achievements')
@ApiBearerAuth()
@Controller()
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Roles(Role.STUDENT)
  @Get('students/me/achievements')
  myAchievements(@CurrentUser() user: { id: string }) {
    return this.achievementsService.myAchievements(user.id)
  }

  @Roles(Role.STUDENT, Role.TEACHER)
  @Get('classes/:classId/leaderboard')
  leaderboard(@Param('classId') classId: string) {
    return this.achievementsService.leaderboard(classId)
  }
}
