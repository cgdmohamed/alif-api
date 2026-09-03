import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'
import { School } from './school.entity'

@Entity('school_approvals')
export class SchoolApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => School, (school) => school.approvals, { onDelete: 'CASCADE' })
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

  @CreateDateColumn()
  createdAt: Date
}
