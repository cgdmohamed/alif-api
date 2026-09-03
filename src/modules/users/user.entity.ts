import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'
import { Role } from '../../common/enums/role.enum'

export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  PENDING_CONSENT = 'pending_consent',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Index({ unique: true, where: '"email" IS NOT NULL' })
  @Column({ type: 'varchar', nullable: true })
  email: string | null

  @Index({ unique: true, where: '"phone" IS NOT NULL' })
  @Column({ type: 'varchar', nullable: true })
  phone: string | null

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash: string | null

  @Column({ type: 'enum', enum: Role })
  role: Role

  @Column({ type: 'varchar', nullable: true })
  schoolId: string | null

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number

  @Column({ type: 'timestamptz', nullable: true })
  lockedUntil: Date | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
