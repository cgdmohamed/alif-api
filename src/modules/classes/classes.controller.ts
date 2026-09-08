import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ClassesService } from './classes.service'
import { CreateClassDto } from './dto/create-class.dto'
import { UpdateClassDto } from './dto/update-class.dto'
import { AddMeetingDto } from './dto/add-meeting.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { assertSchoolAccess, type AuthUser } from '../../common/authz/school-access'

@ApiTags('classes')
@ApiBearerAuth()
@Controller()
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Roles(Role.PLATFORM_ADMIN)
  @Get('classes')
  findAll() {
    return this.classesService.findAll()
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Get('schools/:schoolId/classes')
  findAllForSchool(@Param('schoolId') schoolId: string, @CurrentUser() user: AuthUser) {
    assertSchoolAccess(user, schoolId)
    return this.classesService.findAllForSchool(schoolId)
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Post('schools/:schoolId/classes')
  create(@Param('schoolId') schoolId: string, @Body() dto: CreateClassDto, @CurrentUser() user: AuthUser) {
    assertSchoolAccess(user, schoolId)
    return this.classesService.create(schoolId, dto)
  }

  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.STUDENT)
  @Get('classes/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.classesService.findOneForUser(id, user)
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Patch('classes/:id')
  update(@Param('id') id: string, @Body() dto: UpdateClassDto, @CurrentUser() user: AuthUser) {
    return this.classesService.update(id, dto, user)
  }

  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  @Post('classes/:id/meetings')
  addMeeting(@Param('id') id: string, @Body() dto: AddMeetingDto, @CurrentUser() user: AuthUser) {
    return this.classesService.addMeeting(id, dto, user)
  }
}
