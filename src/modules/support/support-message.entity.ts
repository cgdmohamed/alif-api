import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { SupportConversation } from './support-conversation.entity'
import { User } from '../users/user.entity'

@Entity('support_messages')
export class SupportMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => SupportConversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: SupportConversation

  @Column()
  conversationId: string

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User

  @Column()
  senderId: string

  @Column('text')
  text: string

  @CreateDateColumn()
  createdAt: Date
}
