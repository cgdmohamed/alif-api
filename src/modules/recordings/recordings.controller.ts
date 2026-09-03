import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { RecordingsService } from './recordings.service'
import { UpdateRecordingDto } from './dto/update-recording.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('recordings')
@ApiBearerAuth()
@Roles(Role.PLATFORM_ADMIN)
@Controller()
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Get('recordings')
  findAll(@Query('search') search?: string) {
    return this.recordingsService.findAll(search)
  }

  @Patch('recordings/:id')
  update(@Param('id') id: string, @Body() dto: UpdateRecordingDto) {
    return this.recordingsService.update(id, dto)
  }

  @Delete('recordings/:id')
  remove(@Param('id') id: string) {
    return this.recordingsService.remove(id)
  }

  @Get('storage/usage')
  storageUsage() {
    return this.recordingsService.storageUsage()
  }
}
