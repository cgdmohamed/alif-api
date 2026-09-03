import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { School } from './school.entity'

@Entity('school_contacts')
export class SchoolContact {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => School, (school) => school.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School

  @Column()
  schoolId: string

  @Column()
  name: string

  @Column()
  role: string

  @Column()
  phone: string

  @Column()
  email: string
}
