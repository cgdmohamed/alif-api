import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { School } from '../schools/school.entity'

export enum TeacherStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum RosterSource {
  MANUAL = 'manual',
  CSV = 'csv',
  SELF_ENROLLED = 'self_enrolled',
}

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School

  @Column()
  schoolId: string

  /** Linked once the teacher activates their platform account (Phase 1 User). */
  @Column({ type: 'varchar', nullable: true })
  userId: string | null

  @Column()
  name: string

  @Column()
  specialty: string

  @Column()
  email: string

  @Column()
  phone: string

  @Column({ type: 'enum', enum: TeacherStatus, default: TeacherStatus.ACTIVE })
  status: TeacherStatus

  @Column({ type: 'enum', enum: RosterSource, default: RosterSource.MANUAL })
  source: RosterSource

  @CreateDateColumn()
  createdAt: Date
}
