import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { PlatformSettings } from './platform-settings.entity'
import { PdfTemplate } from './pdf-template.entity'
import { SettingsService } from './settings.service'
import { SettingsController } from './settings.controller'
import { EMAIL_PROVIDER } from './providers/email-provider.interface'
import { ConsoleEmailProvider } from './providers/console-email.provider'
import { SmtpEmailProvider } from './providers/smtp-email.provider'
import { SMS_PROVIDER } from './providers/sms-provider.interface'
import { ConsoleSmsProvider } from './providers/console-sms.provider'

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSettings, PdfTemplate])],
  controllers: [SettingsController],
  providers: [
    SettingsService,
    {
      provide: EMAIL_PROVIDER,
      // Falls back to the console stub when SMTP isn't configured (e.g. local dev).
      useFactory: (config: ConfigService) =>
        config.get('SMTP_HOST') ? new SmtpEmailProvider(config) : new ConsoleEmailProvider(),
      inject: [ConfigService],
    },
    { provide: SMS_PROVIDER, useClass: ConsoleSmsProvider },
  ],
  exports: [SettingsService, EMAIL_PROVIDER],
})
export class SettingsModule {}
