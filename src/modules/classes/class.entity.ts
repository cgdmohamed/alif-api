import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { School } from '../schools/school.entity'
import { Resource } from '../resources/resource.entity'
import { Teacher } from '../teachers/teacher.entity'
import { ClassMeeting } from './class-meeting.entity'

export enum ClassStatus {
  PREPARING = 'preparing',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School

  @Column()
  schoolId: string

  @ManyToOne(() => Resource, { nullable: true, eager: true })
  @JoinColumn({ name: 'resourceId' })
  resource: Resource | null

  @Column({ type: 'varchar', nullable: true })
  resourceId: string | null

  @Column({ type: 'int', nullable: true })
  resourceVersionAtGeneration: number | null

  @Column()
  name: string

  @ManyToOne(() => Teacher, { nullable: true, eager: true })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher | null

  @Column({ type: 'varchar', nullable: true })
  teacherId: string | null

  @Column({ type: 'int', default: 0 })
  studentsCount: number

  @Column()
  color: string

  @Column({ type: 'int', default: 0 })
  performance: number

  @Column({ type: 'enum', enum: ClassStatus, default: ClassStatus.PREPARING })
  status: ClassStatus

  @Column({ default: true })
  autoZoom: boolean

  @OneToMany(() => ClassMeeting, (meeting) => meeting.classEntity, { cascade: true })
  meetings: ClassMeeting[]

  @CreateDateColumn()
  createdAt: Date
}
