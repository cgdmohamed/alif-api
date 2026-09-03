import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { SupportService } from './support.service'
import { SendMessageDto } from './dto/send-message.dto'
import { TransferConversationDto } from './dto/transfer-conversation.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('support')
@ApiBearerAuth()
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Roles(Role.SUPPORT_AGENT, Role.PLATFORM_ADMIN)
  @Get('conversations')
  findAll() {
    return this.supportService.findAll()
  }

  @Get('conversations/mine')
  findOrCreateMine(@CurrentUser() user: { id: string }) {
    return this.supportService.findOrCreateMine(user.id)
  }

  @Get('conversations/:id/messages')
  messages(@Param('id') id: string) {
    return this.supportService.messages(id)
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: SendMessageDto,
  ) {
    return this.supportService.sendMessage(id, user.id, dto.text)
  }

  @Roles(Role.SUPPORT_AGENT, Role.PLATFORM_ADMIN)
  @Post('conversations/:id/transfer')
  transfer(@Param('id') id: string, @Body() dto: TransferConversationDto) {
    return this.supportService.transfer(id, dto.agentId)
  }

  @Roles(Role.SUPPORT_AGENT, Role.PLATFORM_ADMIN)
  @Post('conversations/:id/close')
  close(@Param('id') id: string) {
    return this.supportService.close(id)
  }
}
