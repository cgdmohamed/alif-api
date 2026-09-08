import { Inject, Injectable } from '@nestjs/common'
import { EMAIL_PROVIDER, type EmailProvider } from '../../settings/providers/email-provider.interface'
import type { OtpSender } from './otp-sender.interface'

/** Delivers OTP codes over email, reusing SettingsModule's EMAIL_PROVIDER (real SMTP or the console stub). */
@Injectable()
export class EmailOtpSender implements OtpSender {
  constructor(@Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider) {}

  async send(email: string, code: string): Promise<void> {
    await this.emailProvider.send(
      email,
      'رمز الدخول إلى ألف المستقبل',
      `<p>رمز التحقق الخاص بك هو: <b style="font-size:20px">${code}</b></p><p>صالح لمدة 5 دقائق. لا تشارك هذا الرمز مع أي شخص.</p>`,
    )
  }
}
