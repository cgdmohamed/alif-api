import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SupportConversation, ConversationStatus } from './support-conversation.entity'
import { SupportMessage } from './support-message.entity'

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportConversation)
    private readonly conversationsRepository: Repository<SupportConversation>,
    @InjectRepository(SupportMessage)
    private readonly messagesRepository: Repository<SupportMessage>,
  ) {}

  findAll() {
    return this.conversationsRepository.find({ order: { createdAt: 'DESC' } })
  }

  async findOrCreateMine(participantId: string) {
    const existing = await this.conversationsRepository.findOne({
      where: { participantId, status: ConversationStatus.OPEN },
      order: { createdAt: 'DESC' },
    })
    if (existing) return existing
    return this.conversationsRepository.save(this.conversationsRepository.create({ participantId }))
  }

  async findOne(id: string) {
    const conversation = await this.conversationsRepository.findOne({ where: { id } })
    if (!conversation) throw new NotFoundException('Conversation not found')
    return conversation
  }

  messages(conversationId: string) {
    return this.messagesRepository.find({ where: { conversationId }, order: { createdAt: 'ASC' } })
  }

  async sendMessage(conversationId: string, senderId: string, text: string) {
    await this.findOne(conversationId)
    return this.messagesRepository.save(
      this.messagesRepository.create({ conversationId, senderId, text }),
    )
  }

  async transfer(id: string, agentId: string) {
    const conversation = await this.findOne(id)
    conversation.agentId = agentId
    return this.conversationsRepository.save(conversation)
  }

  async close(id: string) {
    const conversation = await this.findOne(id)
    conversation.status = ConversationStatus.CLOSED
    return this.conversationsRepository.save(conversation)
  }
}
