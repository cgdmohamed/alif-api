import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Badge } from './badge.entity'
import { StudentBadge } from './student-badge.entity'
import { Student } from '../students/student.entity'
import { Class } from '../classes/class.entity'
import { assertSchoolAccess, type AuthUser } from '../../common/authz/school-access'

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Badge) private readonly badgesRepository: Repository<Badge>,
    @InjectRepository(StudentBadge) private readonly studentBadgesRepository: Repository<StudentBadge>,
    @InjectRepository(Student) private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Class) private readonly classesRepository: Repository<Class>,
  ) {}

  async myAchievements(userId: string) {
    const student = await this.studentsRepository.findOne({ where: { userId } })
    if (!student) throw new NotFoundException('No student roster record linked to this account')
    const [allBadges, earned] = await Promise.all([
      this.badgesRepository.find(),
      this.studentBadgesRepository.find({ where: { studentId: student.id } }),
    ])
    const earnedBadgeIds = new Set(earned.map((e) => e.badgeId))
    return allBadges.map((badge) => ({ ...badge, locked: !earnedBadgeIds.has(badge.id) }))
  }

  async leaderboard(classId: string, user: AuthUser) {
    const classEntity = await this.classesRepository.findOne({ where: { id: classId } })
    if (!classEntity) throw new NotFoundException('Class not found')
    assertSchoolAccess(user, classEntity.schoolId)
    const students = await this.studentsRepository.find({
      where: { classId },
      order: { points: 'DESC' },
      take: 20,
    })
    return students.map((s, i) => ({ rank: i + 1, studentId: s.id, name: s.name, points: s.points }))
  }
}
