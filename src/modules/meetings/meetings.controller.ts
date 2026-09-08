import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { MeetingsService, type MeetingScope } from './meetings.service'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { UpdateMeetingDto } from './dto/update-meeting.dto'
import { PushActivityDto } from './dto/push-activity.dto'
import { CompleteMeetingDto } from './dto/complete-meeting.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { AuthUser } from '../../common/authz/school-access'

@ApiTags('meetings')
@ApiBearerAuth()
@Roles(Role.TEACHER, Role.STUDENT, Role.PARENT, Role.SCHOOL_ADMIN, Role.PLATFORM_ADMIN)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  findByScope(@CurrentUser() user: AuthUser, @Query('scope') scope?: MeetingScope) {
    return this.meetingsService.findByScope(user, scope)
  }

  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  @Post()
  create(@Body() dto: CreateMeetingDto, @CurrentUser() user: AuthUser) {
    return this.meetingsService.create(dto, user)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.meetingsService.findOneForUser(id, user)
  }

  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMeetingDto, @CurrentUser() user: AuthUser) {
    return this.meetingsService.update(id, dto, user)
  }

  @Post(':id/join')
  join(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.meetingsService.join(id, user)
  }

  @Roles(Role.TEACHER)
  @Get(':id/session-plan')
  sessionPlan(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.meetingsService.sessionPlan(id, user)
  }

  @Roles(Role.TEACHER)
  @Post(':id/push-activity')
  pushActivity(@Param('id') id: string, @Body() dto: PushActivityDto, @CurrentUser() user: AuthUser) {
    return this.meetingsService.pushActivity(id, dto.blockId, user)
  }

  @Roles(Role.TEACHER)
  @Post(':id/complete')
  complete(@Param('id') id: string, @Body() dto: CompleteMeetingDto, @CurrentUser() user: AuthUser) {
    return this.meetingsService.complete(id, dto, user)
  }

  @Get(':id/recording')
  recording(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.meetingsService.recording(id, user)
  }
}
