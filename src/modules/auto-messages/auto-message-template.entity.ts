import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm'

@Entity('auto_message_templates')
export class AutoMessageTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  channel: string

  @Column({ default: true })
  enabled: boolean

  @Column('text')
  body: string

  @UpdateDateColumn()
  updatedAt: Date
}
