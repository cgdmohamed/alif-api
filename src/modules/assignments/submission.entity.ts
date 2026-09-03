import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Assignment } from './assignment.entity'
import { Student } from '../students/student.entity'

export enum SubmissionStatus {
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  LATE = 'late',
  GRADED = 'graded',
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Assignment, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment

  @Column()
  assignmentId: string

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student

  @Column()
  studentId: string

  @Column({ type: 'enum', enum: SubmissionStatus, default: SubmissionStatus.IN_PROGRESS })
  status: SubmissionStatus

  @Column('jsonb', { nullable: true })
  answerPayload: Record<string, unknown> | null

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt: Date | null

  @Column({ type: 'int', nullable: true })
  grade: number | null

  @Column({ type: 'timestamptz', nullable: true })
  gradedAt: Date | null

  @Column('text', { nullable: true })
  teacherNote: string | null

  @CreateDateColumn()
  createdAt: Date
}
