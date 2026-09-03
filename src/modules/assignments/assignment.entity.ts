import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Class } from '../classes/class.entity'
import { ContentBlock } from '../programs/content-block.entity'

export enum AssignmentKind {
  QUIZ = 'quiz',
  ESSAY = 'essay',
  PUZZLE = 'puzzle',
}

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  classEntity: Class

  @Column()
  classId: string

  @ManyToOne(() => ContentBlock, { nullable: true })
  @JoinColumn({ name: 'blockId' })
  block: ContentBlock | null

  @Column({ type: 'varchar', nullable: true })
  blockId: string | null

  @Column()
  title: string

  @Column({ type: 'enum', enum: AssignmentKind })
  kind: AssignmentKind

  @Column({ type: 'timestamptz' })
  dueAt: Date

  @CreateDateColumn()
  createdAt: Date
}
