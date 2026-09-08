import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Repository } from 'typeorm'
import { PlatformSettings } from './platform-settings.entity'
import { PdfTemplate } from './pdf-template.entity'
import { EMAIL_PROVIDER, type EmailProvider } from './providers/email-provider.interface'
import { SMS_PROVIDER, type SmsProvider } from './providers/sms-provider.interface'
import type { UpdateSettingsDto } from './dto/update-settings.dto'

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(PlatformSettings)
    private readonly settingsRepository: Repository<PlatformSettings>,
    @InjectRepository(PdfTemplate) private readonly pdfTemplatesRepository: Repository<PdfTemplate>,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
    @Inject(SMS_PROVIDER) private readonly smsProvider: SmsProvider,
    private readonly config: ConfigService,
  ) {}

  async get() {
    const existing = await this.settingsRepository.find({ take: 1 })
    if (existing[0]) return existing[0]
    return this.settingsRepository.save(this.settingsRepository.create({}))
  }

  async update(dto: UpdateSettingsDto) {
    const settings = await this.get()
    Object.assign(settings, dto)
    return this.settingsRepository.save(settings)
  }

  async testConnection(target: 'agora' | 'smtp' | 'sms') {
    if (target === 'smtp') {
      const recipient = this.config.get<string>('SMTP_USER')
      if (!recipient) return { target, success: false }
      await this.emailProvider.send(recipient, 'Alef test email', 'This is a test message.')
    }
    if (target === 'sms') {
      return { target, success: false }
    }
    if (target === 'agora') {
      // No connection to actually ping — Agora tokens are minted locally
      // from these two values, not fetched from a live endpoint. Report
      // whether the real provider is even configured instead of a
      // hardcoded "success" (see MeetingsModule for the same check).
      const configured = Boolean(this.config.get('AGORA_APP_ID') && this.config.get('AGORA_APP_CERTIFICATE'))
      return { target, success: configured }
    }
    return { target, success: true }
  }

  pdfTemplates() {
    return this.pdfTemplatesRepository.find()
  }
}
