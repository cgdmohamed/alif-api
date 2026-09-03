import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'
import { School } from './school.entity'

export enum InvoiceStatus {
  PAID = 'paid',
  PENDING = 'pending',
  OVERDUE = 'overdue',
}

@Entity('school_invoices')
export class SchoolInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School

  @Column()
  schoolId: string

  @Column({ type: 'date' })
  issuedAt: string

  @Column({ type: 'int' })
  amount: number

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus

  @CreateDateColumn()
  createdAt: Date
}
