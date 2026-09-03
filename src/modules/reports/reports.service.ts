import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Student } from '../students/student.entity'
import { Class } from '../classes/class.entity'
import { Submission, SubmissionStatus } from '../assignments/submission.entity'
import { AttendanceRecord, AttendanceStatus } from './attendance.entity'
import { Role } from '../../common/enums/role.enum'

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Student) private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Class) private readonly classesRepository: Repository<Class>,
    @InjectRepository(Submission) private readonly submissionsRepository: Repository<Submission>,
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepository: Repository<AttendanceRecord>,
  ) {}

  async overview(schoolId?: string) {
    const students = await this.studentsRepository.find({ where: schoolId ? { schoolId } : {} })
    const studentIds = students.map((s) => s.id)

    const gradedSubmissions = studentIds.length
      ? await this.submissionsRepository
          .createQueryBuilder('submission')
          .where('submission.studentId IN (:...studentIds)', { studentIds })
          .andWhere('submission.status = :status', { status: SubmissionStatus.GRADED })
          .getMany()
      : []

    const averagePerformance = gradedSubmissions.length
      ? Math.round(
          gradedSubmissions.reduce((sum, s) => sum + (s.grade ?? 0), 0) / gradedSubmissions.length,
        )
      : 0

    const attendanceRecords = studentIds.length
      ? await this.attendanceRepository
          .createQueryBuilder('attendance')
          .where('attendance.studentId IN (:...studentIds)', { studentIds })
          .getMany()
      : []
    const averageAttendance = attendanceRecords.length
      ? Math.round(
          (attendanceRecords.filter((a) => a.status === AttendanceStatus.PRESENT).length /
            attendanceRecords.length) *
            100,
        )
      : 0

    return {
      studentsCount: students.length,
      averagePerformance,
      averageAttendance,
      gradedAssignmentsCount: gradedSubmissions.length,
    }
  }

  async studentsTable(schoolId?: string) {
    const students = await this.studentsRepository.find({ where: schoolId ? { schoolId } : {} })
    return Promise.all(students.map((s) => this.studentSummary(s)))
  }

  private async studentSummary(student: Student) {
    const submissions = await this.submissionsRepository.find({ where: { studentId: student.id } })
    const graded = submissions.filter((s) => s.grade !== null)
    const average = graded.length
      ? Math.round(graded.reduce((sum, s) => sum + (s.grade ?? 0), 0) / graded.length)
      : 0

    const attendance = await this.attendanceRepository.find({ where: { studentId: student.id } })
    const attendancePercent = attendance.length
      ? Math.round(
          (attendance.filter((a) => a.status === AttendanceStatus.PRESENT).length /
            attendance.length) *
            100,
        )
      : 0

    const classEntity = student.classId
      ? await this.classesRepository.findOne({ where: { id: student.classId } })
      : null

    return {
      id: student.id,
      name: student.name,
      className: classEntity?.name ?? null,
      average,
      attendancePercent,
      points: student.points,
    }
  }

  async studentDetail(studentId: string) {
    const student = await this.studentsRepository.findOne({ where: { id: studentId } })
    if (!student) throw new NotFoundException('Student not found')

    const submissions = await this.submissionsRepository.find({
      where: { studentId },
      relations: ['assignment'],
      order: { submittedAt: 'DESC' },
    })
    const attendance = await this.attendanceRepository.find({
      where: { studentId },
      order: { id: 'DESC' },
    })

    const summary = await this.studentSummary(student)
    return { student, submissions, attendance, summary }
  }

  /**
   * Enforces that a STUDENT can only view their own roster row, a PARENT
   * can only view a roster row they've completed consent for, and a
   * TEACHER/SCHOOL_ADMIN can only view students within their own school.
   * PLATFORM_ADMIN is unrestricted.
   */
  async studentDetailForUser(studentId: string, user: { id: string; role: Role; schoolId: string | null }) {
    if (user.role === Role.PLATFORM_ADMIN) {
      return this.studentDetail(studentId)
    }

    const student = await this.studentsRepository.findOne({ where: { id: studentId } })
    if (!student) throw new NotFoundException('Student not found')

    const allowed =
      (user.role === Role.STUDENT && student.userId === user.id) ||
      (user.role === Role.PARENT && student.parentUserId === user.id) ||
      ((user.role === Role.TEACHER || user.role === Role.SCHOOL_ADMIN) &&
        user.schoolId !== null &&
        student.schoolId === user.schoolId)
    if (!allowed) throw new ForbiddenException('You do not have access to this report')

    return this.studentDetail(studentId)
  }

  async myReport(userId: string) {
    const student = await this.studentsRepository.findOne({ where: { userId } })
    if (!student) throw new NotFoundException('No student roster record linked to this account')
    return this.studentDetail(student.id)
  }
}
