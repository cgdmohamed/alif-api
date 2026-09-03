import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
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

  async testConnection(target: 'zoom' | 'smtp' | 'sms') {
    if (target === 'smtp') {
      await this.emailProvider.send('test@alef.dev', 'Alef test email', 'This is a test message.')
    }
    if (target === 'sms') {
      await this.smsProvider.send('+966500000000', 'Alef test SMS')
    }
    // Zoom test is a no-op ping in the mock provider — real implementation calls the Zoom API.
    return { target, success: true }
  }

  pdfTemplates() {
    return this.pdfTemplatesRepository.find()
  }
}
