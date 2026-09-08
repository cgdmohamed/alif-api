import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm'
import { Student } from '../students/student.entity'
import { Meeting } from '../meetings/meeting.entity'

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
}

@Entity('attendance_records')
@Unique(['studentId', 'meetingId'])
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student

  @Column()
  studentId: string

  @ManyToOne(() => Meeting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meetingId' })
  meeting: Meeting

  @Column()
  meetingId: string

  @Column({ type: 'enum', enum: AttendanceStatus })
  status: AttendanceStatus

  @Column('text', { nullable: true })
  reason: string | null
}
