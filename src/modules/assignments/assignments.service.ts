import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Not, Repository } from 'typeorm'
import { Assignment } from './assignment.entity'
import { Submission, SubmissionStatus } from './submission.entity'
import { Student } from '../students/student.entity'
import type { CreateAssignmentDto } from './dto/create-assignment.dto'
import type { SubmitAssignmentDto } from './dto/submit-assignment.dto'
import type { GradeSubmissionDto } from './dto/grade-submission.dto'
import { Class } from '../classes/class.entity'
import { Role } from '../../common/enums/role.enum'
import { assertSchoolAccess, type AuthUser } from '../../common/authz/school-access'
import { NotificationsService } from '../notifications/notifications.service'

const POINTS_PER_GRADED_ASSIGNMENT = 10

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentsRepository: Repository<Assignment>,
    @InjectRepository(Submission)
    private readonly submissionsRepository: Repository<Submission>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Class)
    private readonly classesRepository: Repository<Class>,
    private readonly notifications: NotificationsService,
  ) {}

  private async assertClassAccess(classId: string, user: AuthUser) {
    const classEntity = await this.classesRepository.findOne({
      where: { id: classId },
    })
    if (!classEntity) throw new NotFoundException('Class not found')
    assertSchoolAccess(user, classEntity.schoolId)
  }

  private async studentForUser(userId: string) {
    const student = await this.studentsRepository.findOne({
      where: { userId },
    })
    if (!student) throw new NotFoundException('No student roster record linked to this account')
    return student
  }

  async findForClass(classId: string, user: AuthUser) {
    await this.assertClassAccess(classId, user)
    return this.assignmentsRepository.find({
      where: { classId },
      order: { dueAt: 'ASC' },
    })
  }

  async findAllWithCounts(user: AuthUser) {
    const assignments = await this.assignmentsRepository.find({
      relations: ['classEntity'],
      order: { dueAt: 'DESC' },
    })
    const scoped =
      user.role === Role.PLATFORM_ADMIN
        ? assignments
        : assignments.filter((assignment) => assignment.classEntity.schoolId === user.schoolId)
    return Promise.all(
      scoped.map(async (a) => {
        const submitted = await this.submissionsRepository.count({
          where: { assignmentId: a.id, submittedAt: Not(IsNull()) },
        })
        const graded = await this.submissionsRepository.count({
          where: { assignmentId: a.id, grade: Not(IsNull()) },
        })
        return { ...a, submitted, graded }
      }),
    )
  }

  async create(classId: string, dto: CreateAssignmentDto, user: AuthUser) {
    await this.assertClassAccess(classId, user)
    const assignment = await this.assignmentsRepository.save(
      this.assignmentsRepository.create({
        classId,
        title: dto.title,
        kind: dto.kind,
        dueAt: new Date(dto.dueAt),
        blockId: dto.blockId ?? null,
      }),
    )
    const students = await this.studentsRepository.find({ where: { classId } })
    await Promise.all(
      students
        .filter((student) => student.userId)
        .map((student) =>
          this.notifications.create(
            student.userId!,
            'واجب جديد',
            `${assignment.title} — آخر موعد ${assignment.dueAt.toLocaleDateString('ar')}`,
          ),
        ),
    )
    return assignment
  }

  async findOne(id: string) {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id },
    })
    if (!assignment) throw new NotFoundException('Assignment not found')
    return assignment
  }

  private async submissionFor(assignmentId: string, studentId: string) {
    let submission = await this.submissionsRepository.findOne({
      where: { assignmentId, studentId },
    })
    if (!submission) {
      submission = await this.submissionsRepository.save(this.submissionsRepository.create({ assignmentId, studentId }))
    }
    return submission
  }

  async myAssignments(userId: string) {
    const student = await this.studentForUser(userId)
    if (!student.classId) return []

    const assignments = await this.assignmentsRepository.find({
      where: { classId: student.classId },
      order: { dueAt: 'ASC' },
    })
    const submissions = await this.submissionsRepository.find({
      where: { studentId: student.id },
    })
    const byAssignment = new Map(submissions.map((s) => [s.assignmentId, s]))

    return assignments.map((a) => ({
      ...a,
      submission: byAssignment.get(a.id) ?? null,
    }))
  }

  async assignmentDetail(assignmentId: string, studentId: string) {
    const assignment = await this.findOne(assignmentId)
    const submission = await this.submissionFor(assignmentId, studentId)
    return { assignment, submission }
  }

  async assignmentDetailForUser(assignmentId: string, user: AuthUser) {
    const assignment = await this.findOne(assignmentId)
    if (user.role === Role.TEACHER || user.role === Role.PLATFORM_ADMIN) {
      await this.assertClassAccess(assignment.classId, user)
      return { assignment, submission: null }
    }
    const student = await this.studentForUser(user.id)
    if (student.classId !== assignment.classId) throw new NotFoundException('Assignment not found')
    return this.assignmentDetail(assignmentId, student.id)
  }

  async submit(assignmentId: string, userId: string, dto: SubmitAssignmentDto) {
    const assignment = await this.findOne(assignmentId)
    const student = await this.studentForUser(userId)
    if (student.classId !== assignment.classId) throw new NotFoundException('Assignment not found')
    const submission = await this.submissionFor(assignmentId, student.id)
    submission.answerPayload = dto.answerPayload
    submission.submittedAt = new Date()
    submission.status = new Date() > assignment.dueAt ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED
    return this.submissionsRepository.save(submission)
  }

  async result(assignmentId: string, userId: string) {
    const assignment = await this.findOne(assignmentId)
    const student = await this.studentForUser(userId)
    if (student.classId !== assignment.classId) throw new NotFoundException('Assignment not found')
    const submission = await this.submissionsRepository.findOne({
      where: { assignmentId, studentId: student.id },
    })
    if (!submission || submission.grade === null) {
      throw new NotFoundException('This assignment has not been graded yet')
    }
    return submission
  }

  async submissionsForAssignment(assignmentId: string, user: AuthUser) {
    const assignment = await this.findOne(assignmentId)
    await this.assertClassAccess(assignment.classId, user)
    return this.submissionsRepository.find({
      where: { assignmentId },
      relations: ['student'],
      order: { submittedAt: 'DESC' },
    })
  }

  async gradingQueue(user: AuthUser) {
    const submissions = await this.submissionsRepository.find({
      where: { grade: IsNull(), submittedAt: Not(IsNull()) },
      relations: ['assignment', 'assignment.classEntity', 'student'],
      order: { submittedAt: 'ASC' },
    })
    return user.role === Role.PLATFORM_ADMIN
      ? submissions
      : submissions.filter((submission) => submission.assignment.classEntity.schoolId === user.schoolId)
  }

  async grade(submissionId: string, dto: GradeSubmissionDto, user: AuthUser) {
    const submission = await this.submissionsRepository.findOne({
      where: { id: submissionId },
      relations: ['assignment', 'assignment.classEntity'],
    })
    if (!submission) throw new NotFoundException('Submission not found')
    assertSchoolAccess(user, submission.assignment.classEntity.schoolId)
    if (!submission.submittedAt) {
      throw new BadRequestException('Cannot grade a submission that has not been turned in')
    }
    const firstGrade = submission.grade === null
    submission.grade = dto.grade
    submission.teacherNote = dto.teacherNote ?? null
    submission.gradedAt = new Date()
    submission.status = SubmissionStatus.GRADED
    await this.submissionsRepository.save(submission)

    if (firstGrade) {
      await this.studentsRepository.increment({ id: submission.studentId }, 'points', POINTS_PER_GRADED_ASSIGNMENT)
    }

    const student = await this.studentsRepository.findOne({
      where: { id: submission.studentId },
    })
    if (student?.userId) {
      await this.notifications.create(student.userId, 'تم تصحيح الواجب', `درجتك ${dto.grade} من 100`)
    }

    return submission
  }
}
