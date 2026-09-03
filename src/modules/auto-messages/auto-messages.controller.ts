import { Body, Controller, Get, Param, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AutoMessagesService } from './auto-messages.service'
import { UpdateTemplateDto } from './dto/update-template.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('auto-messages')
@ApiBearerAuth()
@Roles(Role.PLATFORM_ADMIN)
@Controller('auto-message-templates')
export class AutoMessagesController {
  constructor(private readonly autoMessagesService: AutoMessagesService) {}

  @Get()
  findAll() {
    return this.autoMessagesService.findAll()
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.autoMessagesService.update(id, dto)
  }
}
