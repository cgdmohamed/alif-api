import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm'
import { Meeting } from '../meetings/meeting.entity'

@Entity('recordings')
export class Recording {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => Meeting, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'meetingId' })
  meeting: Meeting

  @Column()
  meetingId: string

  @Column()
  title: string

  @Column()
  playbackUrl: string

  @Column({ type: 'int', default: 0 })
  durationSeconds: number

  @Column({ type: 'int', default: 0 })
  views: number

  @Column({ type: 'bigint', default: 0 })
  sizeBytes: number

  @Column({ default: false })
  isPublic: boolean

  @CreateDateColumn()
  createdAt: Date
}
