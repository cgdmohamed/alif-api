import { Controller, ForbiddenException, Get, Param, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ReportsService } from './reports.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('reports')
@ApiBearerAuth()
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Get('reports/overview')
  overview(@Query('schoolId') schoolId: string | undefined, @CurrentUser() user: { role: Role; schoolId: string | null }) {
    return this.reportsService.overview(this.scopeSchoolId(schoolId, user))
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Get('reports/students')
  studentsTable(@Query('schoolId') schoolId: string | undefined, @CurrentUser() user: { role: Role; schoolId: string | null }) {
    return this.reportsService.studentsTable(this.scopeSchoolId(schoolId, user))
  }

  /**
   * A school admin or teacher is scoped to their own school regardless of
   * what's in the query string — only a platform admin may pass an
   * arbitrary/absent one. A non-admin with no schoolId on their account is
   * a misconfiguration, not a license to see platform-wide data.
   */
  private scopeSchoolId(queryed: string | undefined, user: { role: Role; schoolId: string | null }) {
    if (user.role === Role.PLATFORM_ADMIN) return queryed
    if (!user.schoolId) throw new ForbiddenException('Your account is not linked to a school')
    return user.schoolId
  }

  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT)
  @Get('reports/students/:id')
  studentDetail(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role; schoolId: string | null },
  ) {
    return this.reportsService.studentDetailForUser(id, user)
  }

  @Roles(Role.STUDENT)
  @Get('students/me/report')
  myReport(@CurrentUser() user: { id: string }) {
    return this.reportsService.myReport(user.id)
  }
}
