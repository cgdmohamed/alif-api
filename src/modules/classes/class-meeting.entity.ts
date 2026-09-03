import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Class } from './class.entity'

@Entity('class_meetings')
export class ClassMeeting {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Class, (classEntity) => classEntity.meetings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  classEntity: Class

  @Column()
  classId: string

  @Column()
  title: string

  @Column({ type: 'date' })
  date: string

  @Column()
  time: string
}
