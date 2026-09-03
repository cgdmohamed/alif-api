import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../users/user.entity'

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  userId: string

  @Column()
  title: string

  @Column()
  subtitle: string

  @Column({ default: '🔔' })
  iconBody: string

  @Column({ default: '#4338F2' })
  iconColor: string

  @Column({ default: false })
  read: boolean

  @CreateDateColumn()
  createdAt: Date
}
