import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SupportConversation } from './support-conversation.entity'
import { SupportMessage } from './support-message.entity'
import { SupportService } from './support.service'
import { SupportController } from './support.controller'
import { User } from '../users/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([SupportConversation, SupportMessage, User])],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
