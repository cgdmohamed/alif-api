import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { EnrollmentCodesService } from './enrollment-codes.service'
import { CreateEnrollmentCodeDto } from './dto/create-enrollment-code.dto'
import { RedeemCodeDto } from './dto/redeem-code.dto'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Role } from '../../common/enums/role.enum'
import { assertSchoolAccess, type AuthUser } from '../../common/authz/school-access'

@ApiTags('enrollment-codes')
@ApiBearerAuth()
@Controller()
export class EnrollmentCodesController {
  constructor(private readonly codesService: EnrollmentCodesService) {}

  @Roles(Role.SCHOOL_ADMIN)
  @Get('schools/:schoolId/enrollment-codes')
  findAllForSchool(@Param('schoolId') schoolId: string, @CurrentUser() user: AuthUser) {
    assertSchoolAccess(user, schoolId)
    return this.codesService.findAllForSchool(schoolId)
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Post('schools/:schoolId/enrollment-codes')
  create(@Param('schoolId') schoolId: string, @Body() dto: CreateEnrollmentCodeDto, @CurrentUser() user: AuthUser) {
    assertSchoolAccess(user, schoolId)
    return this.codesService.create(schoolId, dto)
  }

  @Roles(Role.SCHOOL_ADMIN)
  @Patch('enrollment-codes/:id/disable')
  disable(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.codesService.disable(id, user)
  }

  @Roles(Role.STUDENT)
  @Post('enrollment/redeem')
  redeem(@Body() dto: RedeemCodeDto, @CurrentUser() user: { id: string }) {
    return this.codesService.redeem(dto.code, user.id)
  }
}
