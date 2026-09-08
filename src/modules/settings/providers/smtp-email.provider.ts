import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import type { EmailProvider } from './email-provider.interface'

/** Real SMTP delivery — bound in place of ConsoleEmailProvider once SMTP_* env vars are set. */
@Injectable()
export class SmtpEmailProvider implements EmailProvider {
  private readonly logger = new Logger(SmtpEmailProvider.name)
  private readonly transporter: nodemailer.Transporter
  private readonly from: string

  constructor(config: ConfigService) {
    this.from = config.get<string>('SMTP_FROM') || config.get<string>('SMTP_USER')!
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST'),
      port: Number(config.get<string>('SMTP_PORT') ?? 465),
      secure: Number(config.get<string>('SMTP_PORT') ?? 465) === 465,
      auth: {
        user: config.get<string>('SMTP_USER'),
        pass: config.get<string>('SMTP_PASS'),
      },
    })
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html: body })
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${(error as Error).message}`)
      throw error
    }
  }
}
