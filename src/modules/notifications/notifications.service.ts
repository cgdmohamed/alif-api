import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Notification } from './notification.entity'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly notificationsRepository: Repository<Notification>,
  ) {}

  findForUser(userId: string) {
    return this.notificationsRepository.find({ where: { userId }, order: { createdAt: 'DESC' } })
  }

  async markRead(id: string, userId: string) {
    const notification = await this.notificationsRepository.findOne({ where: { id, userId } })
    if (!notification) throw new NotFoundException('Notification not found')
    notification.read = true
    return this.notificationsRepository.save(notification)
  }

  async markAllRead(userId: string) {
    await this.notificationsRepository.update({ userId, read: false }, { read: true })
    return { updated: true }
  }

  async unreadCount(userId: string) {
    const count = await this.notificationsRepository.count({ where: { userId, read: false } })
    return { count }
  }

  create(userId: string, title: string, subtitle: string) {
    return this.notificationsRepository.save(
      this.notificationsRepository.create({ userId, title, subtitle }),
    )
  }
}
