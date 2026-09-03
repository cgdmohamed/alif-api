import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { User } from '../users/user.entity'
import { UsersModule } from '../users/users.module'
import { Student } from '../students/student.entity'
import { RefreshToken } from './refresh-token.entity'
import { OtpCode } from './otp.entity'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { OTP_SENDER } from './providers/otp-sender.interface'
import { ConsoleOtpSender } from './providers/console-otp-sender'
import { ActivityLogModule } from '../activity-log/activity-log.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, OtpCode, Student]),
    UsersModule,
    ActivityLogModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRES_IN') ?? '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, { provide: OTP_SENDER, useClass: ConsoleOtpSender }],
  exports: [AuthService],
})
export class AuthModule {}
