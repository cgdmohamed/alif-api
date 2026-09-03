import { Injectable, Logger } from '@nestjs/common'
import type { EmailProvider } from './email-provider.interface'

/** Dev/local stand-in for real SMTP. Swap the binding once credentials exist. */
@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
  private readonly logger = new Logger(ConsoleEmailProvider.name)

  async send(to: string, subject: string, body: string): Promise<void> {
    this.logger.log(`Email to ${to} — ${subject}: ${body}`)
  }
}
