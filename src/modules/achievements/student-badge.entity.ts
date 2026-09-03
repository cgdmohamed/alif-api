import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'
import { Student } from '../students/student.entity'
import { Badge } from './badge.entity'

@Entity('student_badges')
export class StudentBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student

  @Column()
  studentId: string

  @ManyToOne(() => Badge, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'badgeId' })
  badge: Badge

  @Column()
  badgeId: string

  @CreateDateColumn()
  earnedAt: Date
}
