import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ResourcesService } from './resources.service'
import { CreateResourceDto } from './dto/create-resource.dto'
import { UpdateResourceDto } from './dto/update-resource.dto'
import { ResourceStatus } from './resource.entity'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('resources')
@ApiBearerAuth()
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Roles(Role.PLATFORM_ADMIN)
  @Get()
  findAll(@Query('status') status?: ResourceStatus) {
    return this.resourcesService.findAll({ status })
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Post()
  create(@Body() dto: CreateResourceDto) {
    return this.resourcesService.create(dto)
  }

  // Any authenticated role can view a resource; the global JWT guard still applies.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    return this.resourcesService.update(id, dto)
  }
}
