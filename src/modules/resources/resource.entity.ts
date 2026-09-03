import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export enum ResourceStage {
  PRIMARY = 'ابتدائي',
  MIDDLE = 'متوسط',
  SECONDARY = 'ثانوي',
}

export enum ResourceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  subject: string

  @Column({ type: 'enum', enum: ResourceStage })
  stage: ResourceStage

  @Column()
  program: string

  @Column('text')
  description: string

  @Column({ type: 'int', default: 0 })
  sessionsCount: number

  @Column({ type: 'int', default: 0 })
  questionsIncluded: number

  @Column({ type: 'int', default: 0 })
  contentItemsIncluded: number

  @Column()
  requiredFeature: string

  @Column()
  color: string

  @Column({ type: 'enum', enum: ResourceStatus, default: ResourceStatus.DRAFT })
  status: ResourceStatus

  @Column({ type: 'int', default: 1 })
  versionNumber: number

  @Column({ type: 'int', default: 0 })
  schoolsUsingCount: number

  @Column({ type: 'int', default: 0 })
  totalStudentsCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
