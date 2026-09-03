import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HomeService } from './home.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('home')
@ApiBearerAuth()
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Roles(Role.STUDENT)
  @Get('student')
  studentHome(@CurrentUser() user: { id: string }) {
    return this.homeService.studentHome(user.id)
  }

  @Roles(Role.PARENT)
  @Get('parent')
  parentHome(@CurrentUser() user: { id: string }) {
    return this.homeService.parentHome(user.id)
  }
}
