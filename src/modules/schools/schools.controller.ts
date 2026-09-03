import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { SchoolsService } from './schools.service'
import { CreateSchoolDto } from './dto/create-school.dto'
import { UpdateSchoolDto } from './dto/update-school.dto'
import { SubscribeSchoolDto } from './dto/subscribe-school.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('schools')
@ApiBearerAuth()
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Roles(Role.PLATFORM_ADMIN)
  @Get()
  findAll() {
    return this.schoolsService.findAll()
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Post()
  create(@Body() dto: CreateSchoolDto) {
    return this.schoolsService.create(dto)
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id)
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
    return this.schoolsService.update(id, dto)
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post(':id/subscription')
  subscribe(@Param('id') id: string, @Body() dto: SubscribeSchoolDto) {
    return this.schoolsService.subscribe(id, dto)
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Get(':id/invoices')
  invoices(@Param('id') id: string) {
    return this.schoolsService.invoices(id)
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Get(':id/approvals')
  approvals(@Param('id') id: string) {
    return this.schoolsService.approvals(id)
  }
}
