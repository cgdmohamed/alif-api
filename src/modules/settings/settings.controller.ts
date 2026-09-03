import { Body, Controller, Get, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { SettingsService } from './settings.service'
import { UpdateSettingsDto } from './dto/update-settings.dto'
import { TestConnectionDto } from './dto/test-connection.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('settings')
@ApiBearerAuth()
@Roles(Role.PLATFORM_ADMIN)
@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('settings')
  get() {
    return this.settingsService.get()
  }

  @Patch('settings')
  update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto)
  }

  @Post('settings/test-connection')
  testConnection(@Body() dto: TestConnectionDto) {
    return this.settingsService.testConnection(dto.target)
  }

  @Get('pdf-templates')
  pdfTemplates() {
    return this.settingsService.pdfTemplates()
  }
}
