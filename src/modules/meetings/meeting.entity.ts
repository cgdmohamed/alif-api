import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Class } from '../classes/class.entity'

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
}

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Class, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'classId' })
  classEntity: Class

  @Column()
  classId: string

  @Column()
  title: string

  @Column({ type: 'timestamptz' })
  scheduledAt: Date

  @Column({ type: 'int' })
  durationMinutes: number

  @Column({ type: 'enum', enum: MeetingStatus, default: MeetingStatus.SCHEDULED })
  status: MeetingStatus

  /**
   * Agora channel name. There's no persistent "meeting" object or static
   * join URL — a fresh, short-lived join token is minted per user per
   * attempt instead (see MeetingsService.join / AgoraProvider.generateJoinToken).
   */
  @Column({ type: 'varchar', nullable: true })
  agoraChannelName: string | null

  @Column('uuid', { array: true, default: () => "'{}'" })
  sessionPlanBlockIds: string[]

  @Column({ type: 'varchar', nullable: true })
  pushedActivityBlockId: string | null

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null

  @Column('jsonb', { nullable: true })
  completionChecklist: Record<string, boolean> | null

  @Column({ type: 'int', nullable: true })
  completionRating: number | null

  @Column('text', { nullable: true })
  completionNote: string | null

  @CreateDateColumn()
  createdAt: Date
}
