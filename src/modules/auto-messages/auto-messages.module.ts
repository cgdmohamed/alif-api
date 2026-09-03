import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AutoMessageTemplate } from './auto-message-template.entity'
import { AutoMessagesService } from './auto-messages.service'
import { AutoMessagesController } from './auto-messages.controller'

@Module({
  imports: [TypeOrmModule.forFeature([AutoMessageTemplate])],
  controllers: [AutoMessagesController],
  providers: [AutoMessagesService],
  exports: [AutoMessagesService],
})
export class AutoMessagesModule {}
