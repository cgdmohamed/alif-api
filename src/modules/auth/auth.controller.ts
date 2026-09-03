import { Body, Controller, Post, Get } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { OtpRequestDto } from './dto/otp-request.dto'
import { OtpVerifyDto } from './dto/otp-verify.dto'
import { SignupDto } from './dto/signup.dto'
import { ParentConsentDto } from './dto/parent-consent.dto'
import { RefreshDto } from './dto/refresh.dto'
import { Public } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('otp/request')
  requestOtp(@Body() dto: OtpRequestDto) {
    return this.authService.requestOtp(dto.phone)
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('otp/verify')
  verifyOtp(@Body() dto: OtpVerifyDto) {
    return this.authService.verifyOtp(dto)
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto)
  }

  @ApiBearerAuth()
  @Roles(Role.PARENT)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('parent-consent')
  parentConsent(@CurrentUser() user: { id: string }, @Body() dto: ParentConsentDto) {
    return this.authService.giveParentConsent(user.id, dto.studentId)
  }

  @Public()
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken)
  }

  @Public()
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post('logout')
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refreshToken)
  }

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: { id: string }) {
    return this.authService.me(user.id)
  }
}
