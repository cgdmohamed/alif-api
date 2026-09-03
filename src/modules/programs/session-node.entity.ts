import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Unit } from './unit.entity'

@Entity('program_sessions')
export class SessionNode {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Unit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unitId' })
  unit: Unit

  @Column()
  unitId: string

  @Column({ type: 'int' })
  sessionNumber: number

  @Column()
  title: string

  @Column({ type: 'int' })
  durationMinutes: number
}
