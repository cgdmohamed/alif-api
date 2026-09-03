import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

export enum ActivityTone {
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  INDIGO = 'indigo',
}

@Entity('activity_log')
export class ActivityLogEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string

  /** Denormalized so the log stays readable even if the actor is later deleted. */
  @Column()
  actorName: string

  @Column({ type: 'varchar', nullable: true })
  actorUserId: string | null

  @Column()
  action: string

  @Column()
  target: string

  @Column({ type: 'varchar', nullable: true })
  ip: string | null

  @Column({ type: 'enum', enum: ActivityTone, default: ActivityTone.INDIGO })
  tone: ActivityTone

  @CreateDateColumn()
  createdAt: Date
}
