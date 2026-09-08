import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'
import { School } from './school.entity'

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('school_approvals')
export class SchoolApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => School, (school) => school.approvals, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'schoolId' })
  school: School

  @Column()
  schoolId: string

  @Column()
  parentName: string

  @Column()
  studentName: string

  @Column()
  note: string

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus

  @Column({ type: 'varchar', nullable: true })
  reviewedBy: string | null

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date | null

  @CreateDateColumn()
  createdAt: Date
}
