import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { School } from '../schools/school.entity'

export enum EnrollmentCodeType {
  SINGLE = 'single',
  MULTI = 'multi',
  BATCH = 'batch',
}

export enum EnrollmentCodeStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}

@Entity('enrollment_codes')
export class EnrollmentCode {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  code: string

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School

  @Column()
  schoolId: string

  /** Will become a real FK once the Class entity exists in Phase 3. */
  @Column()
  classId: string

  @Column({ type: 'enum', enum: EnrollmentCodeType })
  codeType: EnrollmentCodeType

  @Column({ type: 'int' })
  maxUses: number

  @Column({ type: 'int', default: 0 })
  currentUses: number

  @Column({ type: 'date' })
  expiresAt: string

  @Column({ type: 'enum', enum: EnrollmentCodeStatus, default: EnrollmentCodeStatus.ACTIVE })
  status: EnrollmentCodeStatus

  @CreateDateColumn()
  createdAt: Date
}
