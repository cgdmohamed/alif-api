import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AssignmentsService } from './assignments.service'
import { CreateAssignmentDto } from './dto/create-assignment.dto'
import { SubmitAssignmentDto } from './dto/submit-assignment.dto'
import { GradeSubmissionDto } from './dto/grade-submission.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'
import type { AuthUser } from '../../common/authz/school-access'

@ApiTags('assignments')
@ApiBearerAuth()
@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Roles(Role.PLATFORM_ADMIN)
  @Get('assignments')
  findAllWithCounts(@CurrentUser() user: AuthUser) {
    return this.assignmentsService.findAllWithCounts(user)
  }

  @Roles(Role.TEACHER, Role.PLATFORM_ADMIN)
  @Get('classes/:classId/assignments')
  findForClass(@Param('classId') classId: string, @CurrentUser() user: AuthUser) {
    return this.assignmentsService.findForClass(classId, user)
  }

  @Roles(Role.TEACHER, Role.PLATFORM_ADMIN)
  @Post('classes/:classId/assignments')
  create(@Param('classId') classId: string, @Body() dto: CreateAssignmentDto, @CurrentUser() user: AuthUser) {
    return this.assignmentsService.create(classId, dto, user)
  }

  @Roles(Role.STUDENT)
  @Get('students/me/assignments')
  myAssignments(@CurrentUser() user: AuthUser) {
    return this.assignmentsService.myAssignments(user.id)
  }

  @Roles(Role.STUDENT, Role.TEACHER)
  @Get('assignments/:id')
  detail(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.assignmentsService.assignmentDetailForUser(id, user)
  }

  @Roles(Role.TEACHER, Role.PLATFORM_ADMIN)
  @Get('assignments/:id/submissions')
  submissionsForAssignment(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.assignmentsService.submissionsForAssignment(id, user)
  }

  @Roles(Role.STUDENT)
  @Post('assignments/:id/submit')
  submit(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.assignmentsService.submit(id, user.id, dto)
  }

  @Roles(Role.STUDENT)
  @Get('assignments/:id/result')
  result(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.assignmentsService.result(id, user.id)
  }

  @Roles(Role.TEACHER, Role.PLATFORM_ADMIN)
  @Get('grading-queue')
  gradingQueue(@CurrentUser() user: AuthUser) {
    return this.assignmentsService.gradingQueue(user)
  }

  @Roles(Role.TEACHER, Role.PLATFORM_ADMIN)
  @Post('submissions/:id/grade')
  grade(@Param('id') id: string, @Body() dto: GradeSubmissionDto, @CurrentUser() user: AuthUser) {
    return this.assignmentsService.grade(id, dto, user)
  }
}
