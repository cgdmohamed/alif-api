import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Package } from '../packages/package.entity'
import { SchoolContact } from './school-contact.entity'
import { SchoolApproval } from './school-approval.entity'

export enum SchoolStatus {
  ACTIVE = 'active',
  RENEWAL_DUE = 'renewal_due',
  SUSPENDED = 'suspended',
}

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  city: string

  @Column()
  type: string

  @Column()
  principal: string

  @Column({ type: 'enum', enum: SchoolStatus, default: SchoolStatus.ACTIVE })
  status: SchoolStatus

  @ManyToOne(() => Package, { nullable: true, eager: true })
  @JoinColumn({ name: 'packageId' })
  package: Package | null

  @Column({ type: 'varchar', nullable: true })
  packageId: string | null

  @Column({ type: 'date' })
  joinedAt: string

  @OneToMany(() => SchoolContact, (contact) => contact.school, { cascade: true })
  contacts: SchoolContact[]

  @OneToMany(() => SchoolApproval, (approval) => approval.school)
  approvals: SchoolApproval[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
