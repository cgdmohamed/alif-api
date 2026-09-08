import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { SupportService } from './support.service'
import { SendMessageDto } from './dto/send-message.dto'
import { TransferConversationDto } from './dto/transfer-conversation.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'
import type { AuthUser } from '../../common/authz/school-access'

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

  @Roles(Role.SUPPORT_AGENT, Role.PLATFORM_ADMIN)
  @Get('agents')
  agents() {
    return this.supportService.agents()
  }

  @Get('conversations/mine')
  findOrCreateMine(@CurrentUser() user: { id: string }) {
    return this.supportService.findOrCreateMine(user.id)
  }

  @Get('conversations/:id/messages')
  messages(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.supportService.messages(id, user)
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.supportService.sendMessage(id, user, dto.text)
  }

  @Roles(Role.SUPPORT_AGENT, Role.PLATFORM_ADMIN)
  @Post('conversations/:id/transfer')
  transfer(@Param('id') id: string, @Body() dto: TransferConversationDto, @CurrentUser() user: AuthUser) {
    return this.supportService.transfer(id, dto.agentId, user)
  }

  @Roles(Role.SUPPORT_AGENT, Role.PLATFORM_ADMIN)
  @Post('conversations/:id/close')
  close(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.supportService.close(id, user)
  }
}
