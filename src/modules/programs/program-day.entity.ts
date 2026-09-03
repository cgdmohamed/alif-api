import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Resource } from '../resources/resource.entity'

@Entity('program_days')
export class ProgramDay {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Resource, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resourceId' })
  resource: Resource

  @Column()
  resourceId: string

  @Column({ type: 'int' })
  dayNumber: number

  @Column()
  title: string
}
