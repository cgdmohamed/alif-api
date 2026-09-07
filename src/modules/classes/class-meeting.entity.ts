import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Class } from './class.entity'
import { Meeting } from '../meetings/meeting.entity'

@Entity('class_meetings')
export class ClassMeeting {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Class, (classEntity) => classEntity.meetings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  classEntity: Class

  @Column()
  classId: string

  @Column()
  title: string

  @Column({ type: 'date' })
  date: string

  @Column()
  time: string

  /**
   * The real, joinable Meeting this schedule row was created alongside (see
   * ClassesService.addMeeting). Nullable only for rows that predate this
   * link — every new class meeting gets one created transactionally.
   */
  @ManyToOne(() => Meeting, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'meetingId' })
  meeting: Meeting | null

  @Column({ type: 'uuid', nullable: true })
  meetingId: string | null
}
