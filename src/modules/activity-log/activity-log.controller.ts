import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ActivityLogService } from './activity-log.service'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('activity-log')
@ApiBearerAuth()
@Roles(Role.PLATFORM_ADMIN)
@Controller('activity-log')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.activityLogService.findAll(limit ? Number(limit) : undefined)
  }
}
