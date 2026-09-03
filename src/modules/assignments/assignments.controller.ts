import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AssignmentsService } from './assignments.service'
import { CreateAssignmentDto } from './dto/create-assignment.dto'
import { SubmitAssignmentDto } from './dto/submit-assignment.dto'
import { GradeSubmissionDto } from './dto/grade-submission.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('assignments')
@ApiBearerAuth()
@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Roles(Role.PLATFORM_ADMIN)
  @Get('assignments')
  findAllWithCounts() {
    return this.assignmentsService.findAllWithCounts()
  }

  @Roles(Role.TEACHER, Role.PLATFORM_ADMIN)
  @Get('classes/:classId/assignments')
  findForClass(@Param('classId') classId: string) {
    return this.assignmentsService.findForClass(classId)
  }

  @Roles(Role.TEACHER, Role.PLATFORM_ADMIN)
  @Post('classes/:classId/assignments')
  create(@Param('classId') classId: string, @Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(classId, dto)
  }

  @Roles(Role.STUDENT)
  @Get('students/me/assignments')
  myAssignments(@CurrentUser() user: { id: string }) {
    return this.assignmentsService.myAssignments(user.id)
  }

  @Roles(Role.STUDENT, Role.TEACHER)
  @Get('assignments/:id')
  detail(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.assignmentsService.assignmentDetail(id, user.id)
  }

  @Roles(Role.TEACHER, Role.PLATFORM_ADMIN)
  @Get('assignments/:id/submissions')
  submissionsForAssignment(@Param('id') id: string) {
    return this.assignmentsService.submissionsForAssignment(id)
  }

  @Roles(Role.STUDENT)
  @Post('assignments/:id/submit')
  submit(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.assignmentsService.submit(id, user.id, dto)
  }

  @Roles(Role.STUDENT)
  @Get('assignments/:id/result')
  result(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.assignmentsService.result(id, user.id)
  }

  @Roles(Role.TEACHER, Role.PLATFORM_ADMIN)
  @Get('grading-queue')
  gradingQueue() {
    return this.assignmentsService.gradingQueue()
  }

  @Roles(Role.TEACHER, Role.PLATFORM_ADMIN)
  @Post('submissions/:id/grade')
  grade(@Param('id') id: string, @Body() dto: GradeSubmissionDto) {
    return this.assignmentsService.grade(id, dto)
  }
}
