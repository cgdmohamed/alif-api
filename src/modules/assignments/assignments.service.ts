import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Not, Repository } from 'typeorm'
import { Assignment } from './assignment.entity'
import { Submission, SubmissionStatus } from './submission.entity'
import { Student } from '../students/student.entity'
import type { CreateAssignmentDto } from './dto/create-assignment.dto'
import type { SubmitAssignmentDto } from './dto/submit-assignment.dto'
import type { GradeSubmissionDto } from './dto/grade-submission.dto'

const POINTS_PER_GRADED_ASSIGNMENT = 10

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment) private readonly assignmentsRepository: Repository<Assignment>,
    @InjectRepository(Submission) private readonly submissionsRepository: Repository<Submission>,
    @InjectRepository(Student) private readonly studentsRepository: Repository<Student>,
  ) {}

  findForClass(classId: string) {
    return this.assignmentsRepository.find({ where: { classId }, order: { dueAt: 'ASC' } })
  }

  async findAllWithCounts() {
    const assignments = await this.assignmentsRepository.find({
      relations: ['classEntity'],
      order: { dueAt: 'DESC' },
    })
    return Promise.all(
      assignments.map(async (a) => {
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

  create(classId: string, dto: CreateAssignmentDto) {
    return this.assignmentsRepository.save(
      this.assignmentsRepository.create({
        classId,
        title: dto.title,
        kind: dto.kind,
        dueAt: new Date(dto.dueAt),
        blockId: dto.blockId ?? null,
      }),
    )
  }

  async findOne(id: string) {
    const assignment = await this.assignmentsRepository.findOne({ where: { id } })
    if (!assignment) throw new NotFoundException('Assignment not found')
    return assignment
  }

  private async submissionFor(assignmentId: string, studentId: string) {
    let submission = await this.submissionsRepository.findOne({ where: { assignmentId, studentId } })
    if (!submission) {
      submission = await this.submissionsRepository.save(
        this.submissionsRepository.create({ assignmentId, studentId }),
      )
    }
    return submission
  }

  async myAssignments(studentId: string) {
    const student = await this.studentsRepository.findOne({ where: { id: studentId } })
    if (!student?.classId) return []

    const assignments = await this.assignmentsRepository.find({
      where: { classId: student.classId },
      order: { dueAt: 'ASC' },
    })
    const submissions = await this.submissionsRepository.find({ where: { studentId } })
    const byAssignment = new Map(submissions.map((s) => [s.assignmentId, s]))

    return assignments.map((a) => ({ ...a, submission: byAssignment.get(a.id) ?? null }))
  }

  async assignmentDetail(assignmentId: string, studentId: string) {
    const assignment = await this.findOne(assignmentId)
    const submission = await this.submissionFor(assignmentId, studentId)
    return { assignment, submission }
  }

  async submit(assignmentId: string, studentId: string, dto: SubmitAssignmentDto) {
    const assignment = await this.findOne(assignmentId)
    const submission = await this.submissionFor(assignmentId, studentId)
    submission.answerPayload = dto.answerPayload
    submission.submittedAt = new Date()
    submission.status =
      new Date() > assignment.dueAt ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED
    return this.submissionsRepository.save(submission)
  }

  async result(assignmentId: string, studentId: string) {
    const submission = await this.submissionsRepository.findOne({ where: { assignmentId, studentId } })
    if (!submission || submission.grade === null) {
      throw new NotFoundException('This assignment has not been graded yet')
    }
    return submission
  }

  submissionsForAssignment(assignmentId: string) {
    return this.submissionsRepository.find({
      where: { assignmentId },
      relations: ['student'],
      order: { submittedAt: 'DESC' },
    })
  }

  gradingQueue() {
    return this.submissionsRepository.find({
      where: { grade: IsNull(), submittedAt: Not(IsNull()) },
      relations: ['assignment', 'student'],
      order: { submittedAt: 'ASC' },
    })
  }

  async grade(submissionId: string, dto: GradeSubmissionDto) {
    const submission = await this.submissionsRepository.findOne({ where: { id: submissionId } })
    if (!submission) throw new NotFoundException('Submission not found')
    if (!submission.submittedAt) {
      throw new BadRequestException('Cannot grade a submission that has not been turned in')
    }
    submission.grade = dto.grade
    submission.teacherNote = dto.teacherNote ?? null
    submission.gradedAt = new Date()
    submission.status = SubmissionStatus.GRADED
    await this.submissionsRepository.save(submission)

    await this.studentsRepository.increment(
      { id: submission.studentId },
      'points',
      POINTS_PER_GRADED_ASSIGNMENT,
    )

    return submission
  }
}
