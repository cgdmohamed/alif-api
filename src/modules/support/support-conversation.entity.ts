import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../users/user.entity'

export enum ConversationStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity('support_conversations')
export class SupportConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participantId' })
  participant: User

  @Column()
  participantId: string

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'agentId' })
  agent: User | null

  @Column({ type: 'varchar', nullable: true })
  agentId: string | null

  @Column({ type: 'enum', enum: ConversationStatus, default: ConversationStatus.OPEN })
  status: ConversationStatus

  @CreateDateColumn()
  createdAt: Date
}
