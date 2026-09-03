import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  emoji: string

  @Column()
  label: string

  @Column({ unique: true })
  code: string
}
