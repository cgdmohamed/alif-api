import { Body, Controller, ForbiddenException, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ReportsService } from './reports.service'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'
import { MarkAttendanceDto } from './dto/mark-attendance.dto'
import type { AuthUser } from '../../common/authz/school-access'

@ApiTags('reports')
@ApiBearerAuth()
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Get('reports/overview')
  overview(
    @Query('schoolId') schoolId: string | undefined,
    @CurrentUser() user: { role: Role; schoolId: string | null },
  ) {
    return this.reportsService.overview(this.scopeSchoolId(schoolId, user))
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @Get('reports/students')
  studentsTable(
    @Query('schoolId') schoolId: string | undefined,
    @CurrentUser() user: { role: Role; schoolId: string | null },
  ) {
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

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT)
  @Get('reports/students/:id')
  studentDetail(@Param('id') id: string, @CurrentUser() user: { id: string; role: Role; schoolId: string | null }) {
    return this.reportsService.studentDetailForUser(id, user)
  }

  @Roles(Role.STUDENT)
  @Get('students/me/report')
  myReport(@CurrentUser() user: { id: string }) {
    return this.reportsService.myReport(user.id)
  }

  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  @Get('meetings/:meetingId/attendance')
  attendance(@Param('meetingId') meetingId: string, @CurrentUser() user: AuthUser) {
    return this.reportsService.attendanceForMeeting(meetingId, user)
  }

  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
  @Post('meetings/:meetingId/attendance')
  markAttendance(@Param('meetingId') meetingId: string, @Body() dto: MarkAttendanceDto, @CurrentUser() user: AuthUser) {
    return this.reportsService.markAttendance(meetingId, dto.entries, user)
  }
}
