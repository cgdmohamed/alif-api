import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { ContentLibraryService } from './content-library.service'
import { CreateContentItemDto } from './dto/create-content-item.dto'
import type { ContentItemType } from './content-item.entity'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('content-library')
@ApiBearerAuth()
@Controller('content-items')
export class ContentLibraryController {
  constructor(private readonly contentLibraryService: ContentLibraryService) {}

  @Roles(Role.PLATFORM_ADMIN, Role.TEACHER)
  @Get()
  findAll(@Query('folder') folder?: string, @Query('type') type?: ContentItemType) {
    return this.contentLibraryService.findAll({ folder, type })
  }

  @Roles(Role.PLATFORM_ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  create(@Body() dto: CreateContentItemDto, @UploadedFile() file: Express.Multer.File) {
    return this.contentLibraryService.create(dto, file)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentLibraryService.remove(id)
  }
}
