import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { StudentsService } from './students.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { BulkCreateStudentsDto } from './dto/bulk-create-students.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { assertSchoolAccess, type AuthUser } from '../../common/authz/school-access'

@ApiTags('students')
@ApiBearerAuth()
@Controller()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Get('schools/:schoolId/students')
  findAllForSchool(@Param('schoolId') schoolId: string, @CurrentUser() user: AuthUser) {
    assertSchoolAccess(user, schoolId)
    return this.studentsService.findAllForSchool(schoolId)
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('schools/:schoolId/students')
  create(@Param('schoolId') schoolId: string, @Body() dto: CreateStudentDto, @CurrentUser() user: AuthUser) {
    assertSchoolAccess(user, schoolId)
    return this.studentsService.create(schoolId, dto)
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('schools/:schoolId/students/bulk')
  createBulk(@Param('schoolId') schoolId: string, @Body() dto: BulkCreateStudentsDto, @CurrentUser() user: AuthUser) {
    assertSchoolAccess(user, schoolId)
    return this.studentsService.createBulk(schoolId, dto.students)
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Delete('students/:id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.studentsService.remove(id, user)
  }
}
