import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { SessionNode } from './session-node.entity'

export enum BlockType {
  LECTURE = 'lecture',
  ACTIVITY = 'activity',
}

export enum ExecutionMode {
  INDIVIDUAL = 'فردي',
  GROUP = 'جماعي',
  PAIR = 'ثنائي',
}

export enum DeliveryChannel {
  TRAINER_GUIDE_ONLY = 'trainer_guide_only',
  SHARED_LIVE_SCREEN = 'shared_live_screen',
  STUDENT_SYNCHRONOUS = 'student_synchronous',
  STUDENT_ASYNC_HOMEWORK = 'student_async_homework',
}

/**
 * Single-table for both lecture and activity blocks — mirrors the frontend's
 * `ContentBlock = LectureBlock | Activity` discriminated union. Activity-only
 * columns stay nullable for lecture rows.
 */
@Entity('content_blocks')
export class ContentBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => SessionNode, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: SessionNode

  @Column()
  sessionId: string

  @Column({ type: 'enum', enum: BlockType })
  type: BlockType

  @Column()
  title: string

  @Column({ type: 'int' })
  durationMinutes: number

  @Column({ type: 'enum', enum: ExecutionMode, nullable: true })
  executionMode: ExecutionMode | null

  @Column({ type: 'enum', enum: DeliveryChannel, nullable: true })
  deliveryChannel: DeliveryChannel | null

  @Column({ type: 'varchar', nullable: true })
  activityType: string | null

  @Column('text', { nullable: true })
  instructionsText: string | null

  @Column('text', { nullable: true })
  materialsNeeded: string | null

  @Column('text', { nullable: true })
  trainerNotes: string | null

  /** Order within the session, since a session can have several blocks. */
  @Column({ type: 'int', default: 0 })
  position: number
}
