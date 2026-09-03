import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { ProgramDay } from './program-day.entity'

@Entity('program_units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => ProgramDay, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dayId' })
  day: ProgramDay

  @Column()
  dayId: string

  @Column({ type: 'int' })
  unitNumber: number

  @Column()
  title: string
}
