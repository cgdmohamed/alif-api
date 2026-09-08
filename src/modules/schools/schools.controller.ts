import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { SchoolsService } from './schools.service'
import { CreateSchoolDto } from './dto/create-school.dto'
import { UpdateSchoolDto } from './dto/update-school.dto'
import { SubscribeSchoolDto } from './dto/subscribe-school.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { assertSchoolAccess, type AuthUser } from '../../common/authz/school-access'
import { ReviewApprovalDto } from './dto/review-approval.dto'
import { CreateInvoiceDto } from './dto/create-invoice.dto'

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
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    assertSchoolAccess(user, id)
    return this.schoolsService.findOne(id)
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSchoolDto, @CurrentUser() user: AuthUser) {
    assertSchoolAccess(user, id)
    return this.schoolsService.update(id, dto)
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Post(':id/subscription')
  subscribe(@Param('id') id: string, @Body() dto: SubscribeSchoolDto, @CurrentUser() user: AuthUser) {
    assertSchoolAccess(user, id)
    return this.schoolsService.subscribe(id, dto)
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Get(':id/invoices')
  invoices(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    assertSchoolAccess(user, id)
    return this.schoolsService.invoices(id)
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Get(':id/approvals')
  approvals(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    assertSchoolAccess(user, id)
    return this.schoolsService.approvals(id)
  }

  @Roles(Role.PLATFORM_ADMIN, Role.SCHOOL_ADMIN)
  @Patch(':schoolId/approvals/:approvalId')
  reviewApproval(
    @Param('schoolId') schoolId: string,
    @Param('approvalId') approvalId: string,
    @Body() dto: ReviewApprovalDto,
    @CurrentUser() user: AuthUser,
  ) {
    assertSchoolAccess(user, schoolId)
    return this.schoolsService.reviewApproval(schoolId, approvalId, dto.status, user.id)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Post(':id/invoices')
  createInvoice(@Param('id') id: string, @Body() dto: CreateInvoiceDto) {
    return this.schoolsService.createInvoice(id, dto)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Patch(':schoolId/invoices/:invoiceId/pay')
  markInvoicePaid(@Param('schoolId') schoolId: string, @Param('invoiceId') invoiceId: string) {
    return this.schoolsService.markInvoicePaid(schoolId, invoiceId)
  }
}
