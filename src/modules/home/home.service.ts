import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MoreThan, Repository } from 'typeorm'
import { Student } from '../students/student.entity'
import { Meeting } from '../meetings/meeting.entity'
import { Assignment } from '../assignments/assignment.entity'
import { Submission, SubmissionStatus } from '../assignments/submission.entity'
import { Notification } from '../notifications/notification.entity'

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Student) private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Meeting) private readonly meetingsRepository: Repository<Meeting>,
    @InjectRepository(Assignment) private readonly assignmentsRepository: Repository<Assignment>,
    @InjectRepository(Submission) private readonly submissionsRepository: Repository<Submission>,
    @InjectRepository(Notification) private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async studentHome(userId: string) {
    const student = await this.studentsRepository.findOne({ where: { userId } })
    if (!student) throw new NotFoundException('No student roster record linked to this account')

    const nextMeeting = student.classId
      ? await this.meetingsRepository.findOne({
          where: { classId: student.classId, scheduledAt: MoreThan(new Date()) },
          order: { scheduledAt: 'ASC' },
        })
      : null

    const dueAssignments = student.classId
      ? await this.assignmentsRepository.find({
          where: { classId: student.classId },
          order: { dueAt: 'ASC' },
          take: 5,
        })
      : []
    const mySubmissions = await this.submissionsRepository.find({ where: { studentId: student.id } })
    const submittedIds = new Set(
      mySubmissions.filter((s) => s.status !== SubmissionStatus.IN_PROGRESS).map((s) => s.assignmentId),
    )
    const pendingAssignments = dueAssignments.filter((a) => !submittedIds.has(a.id))

    const unreadNotifications = await this.notificationsRepository.count({
      where: { userId, read: false },
    })

    return {
      student: { id: student.id, userId: student.userId, name: student.name, points: student.points },
      nextMeeting,
      pendingAssignments,
      unreadNotifications,
    }
  }

  async parentHome(parentUserId: string) {
    const children = await this.studentsRepository.find({ where: { parentUserId } })
    const summaries = await Promise.all(
      children.map(async (child) => {
        const submissions = await this.submissionsRepository.find({ where: { studentId: child.id } })
        const graded = submissions.filter((s) => s.grade !== null)
        const average = graded.length
          ? Math.round(graded.reduce((sum, s) => sum + (s.grade ?? 0), 0) / graded.length)
          : 0
        return { id: child.id, name: child.name, average, points: child.points }
      }),
    )
    const unreadNotifications = await this.notificationsRepository.count({
      where: { userId: parentUserId, read: false },
    })
    return { children: summaries, unreadNotifications }
  }
}
