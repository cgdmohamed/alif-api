import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { MeetingsService, type MeetingScope } from './meetings.service'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { UpdateMeetingDto } from './dto/update-meeting.dto'
import { PushActivityDto } from './dto/push-activity.dto'
import { CompleteMeetingDto } from './dto/complete-meeting.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('meetings')
@ApiBearerAuth()
@Roles(Role.TEACHER, Role.STUDENT, Role.PARENT, Role.SCHOOL_ADMIN, Role.PLATFORM_ADMIN)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  findByScope(@Query('scope') scope?: MeetingScope) {
    return this.meetingsService.findByScope(scope)
  }

  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  @Post()
  create(@Body() dto: CreateMeetingDto) {
    return this.meetingsService.create(dto)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id)
  }

  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMeetingDto) {
    return this.meetingsService.update(id, dto)
  }

  @Post(':id/join')
  join(@Param('id') id: string) {
    return this.meetingsService.join(id)
  }

  @Roles(Role.TEACHER)
  @Get(':id/session-plan')
  sessionPlan(@Param('id') id: string) {
    return this.meetingsService.sessionPlan(id)
  }

  @Roles(Role.TEACHER)
  @Post(':id/push-activity')
  pushActivity(@Param('id') id: string, @Body() dto: PushActivityDto) {
    return this.meetingsService.pushActivity(id, dto.blockId)
  }

  @Roles(Role.TEACHER)
  @Post(':id/complete')
  complete(@Param('id') id: string, @Body() dto: CompleteMeetingDto) {
    return this.meetingsService.complete(id, dto)
  }

  @Get(':id/recording')
  recording(@Param('id') id: string) {
    return this.meetingsService.recording(id)
  }
}
