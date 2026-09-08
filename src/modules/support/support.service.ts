import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SupportConversation, ConversationStatus } from './support-conversation.entity'
import { SupportMessage } from './support-message.entity'
import { Role } from '../../common/enums/role.enum'
import type { AuthUser } from '../../common/authz/school-access'
import { User, UserStatus } from '../users/user.entity'

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportConversation)
    private readonly conversationsRepository: Repository<SupportConversation>,
    @InjectRepository(SupportMessage)
    private readonly messagesRepository: Repository<SupportMessage>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  findAll() {
    return this.conversationsRepository.find({ order: { createdAt: 'DESC' } })
  }

  agents() {
    return this.usersRepository.find({
      where: { role: Role.SUPPORT_AGENT, status: UserStatus.ACTIVE },
      select: ['id', 'name', 'email', 'role', 'status'],
      order: { name: 'ASC' },
    })
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

  private assertAccess(conversation: SupportConversation, user: AuthUser) {
    const staff = user.role === Role.PLATFORM_ADMIN || user.role === Role.SUPPORT_AGENT
    if (!staff && conversation.participantId !== user.id) {
      throw new ForbiddenException('You do not have access to this conversation')
    }
  }

  async messages(conversationId: string, user: AuthUser) {
    const conversation = await this.findOne(conversationId)
    this.assertAccess(conversation, user)
    return this.messagesRepository.find({ where: { conversationId }, order: { createdAt: 'ASC' } })
  }

  async sendMessage(conversationId: string, user: AuthUser, text: string) {
    const conversation = await this.findOne(conversationId)
    this.assertAccess(conversation, user)
    return this.messagesRepository.save(
      this.messagesRepository.create({ conversationId, senderId: user.id, text }),
    )
  }

  async transfer(id: string, agentId: string, user: AuthUser) {
    const conversation = await this.findOne(id)
    this.assertAccess(conversation, user)
    const agent = await this.usersRepository.findOne({ where: { id: agentId, role: Role.SUPPORT_AGENT, status: UserStatus.ACTIVE } })
    if (!agent) throw new NotFoundException('Support agent not found')
    conversation.agentId = agentId
    return this.conversationsRepository.save(conversation)
  }

  async close(id: string, user: AuthUser) {
    const conversation = await this.findOne(id)
    this.assertAccess(conversation, user)
    conversation.status = ConversationStatus.CLOSED
    return this.conversationsRepository.save(conversation)
  }
}
