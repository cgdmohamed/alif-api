import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { TeachersService } from './teachers.service'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { BulkCreateTeachersDto } from './dto/bulk-create-teachers.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('teachers')
@ApiBearerAuth()
@Controller()
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Get('schools/:schoolId/teachers')
  findAllForSchool(@Param('schoolId') schoolId: string) {
    return this.teachersService.findAllForSchool(schoolId)
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('schools/:schoolId/teachers')
  create(@Param('schoolId') schoolId: string, @Body() dto: CreateTeacherDto) {
    return this.teachersService.create(schoolId, dto)
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('schools/:schoolId/teachers/bulk')
  createBulk(@Param('schoolId') schoolId: string, @Body() dto: BulkCreateTeachersDto) {
    return this.teachersService.createBulk(schoolId, dto.teachers)
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Patch('teachers/:id/status')
  toggleStatus(@Param('id') id: string) {
    return this.teachersService.toggleStatus(id)
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Delete('teachers/:id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id)
  }

  @Roles(Role.TEACHER)
  @Get('teachers/me')
  myProfile(@CurrentUser() user: { id: string }) {
    return this.teachersService.myProfile(user.id)
  }

  @Roles(Role.TEACHER)
  @Get('teachers/me/classes')
  myClasses(@CurrentUser() user: { id: string }) {
    return this.teachersService.myClasses(user.id)
  }
}
