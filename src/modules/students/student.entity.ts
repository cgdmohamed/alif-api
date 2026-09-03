import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { School } from '../schools/school.entity'
import { RosterSource } from '../teachers/teacher.entity'

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School

  @Column()
  schoolId: string

  /** Linked once the student activates their platform account (Phase 1 User). */
  @Column({ type: 'varchar', nullable: true })
  userId: string | null

  /** Linked once a parent account completes consent for this student. */
  @Column({ type: 'varchar', nullable: true })
  parentUserId: string | null

  @Column({ type: 'varchar', nullable: true })
  classId: string | null

  @Column()
  name: string

  @Column({ default: 'غير محدد' })
  stage: string

  /** Not collected for a self-enrolled mobile student until parent consent links a parent account. */
  @Column({ type: 'varchar', nullable: true })
  parentName: string | null

  @Column({ type: 'varchar', nullable: true })
  parentEmail: string | null

  /** Not collected for a self-enrolled mobile student — they authenticate by phone, not email. */
  @Column({ type: 'varchar', nullable: true })
  studentEmail: string | null

  @Column({ type: 'enum', enum: RosterSource, default: RosterSource.MANUAL })
  source: RosterSource

  @Column({ type: 'int', default: 0 })
  points: number

  @CreateDateColumn()
  createdAt: Date
}
