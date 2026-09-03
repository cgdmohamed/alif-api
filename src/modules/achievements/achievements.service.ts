import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Badge } from './badge.entity'
import { StudentBadge } from './student-badge.entity'
import { Student } from '../students/student.entity'

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Badge) private readonly badgesRepository: Repository<Badge>,
    @InjectRepository(StudentBadge) private readonly studentBadgesRepository: Repository<StudentBadge>,
    @InjectRepository(Student) private readonly studentsRepository: Repository<Student>,
  ) {}

  async myAchievements(studentId: string) {
    const [allBadges, earned] = await Promise.all([
      this.badgesRepository.find(),
      this.studentBadgesRepository.find({ where: { studentId } }),
    ])
    const earnedBadgeIds = new Set(earned.map((e) => e.badgeId))
    return allBadges.map((badge) => ({ ...badge, locked: !earnedBadgeIds.has(badge.id) }))
  }

  async leaderboard(classId: string) {
    const students = await this.studentsRepository.find({
      where: { classId },
      order: { points: 'DESC' },
      take: 20,
    })
    return students.map((s, i) => ({ rank: i + 1, studentId: s.id, name: s.name, points: s.points }))
  }
}
