import { Injectable, Logger } from '@nestjs/common'
import type { SmsProvider } from './sms-provider.interface'

/** Dev/local stand-in for a real SMS gateway. Swap the binding once credentials exist. */
@Injectable()
export class ConsoleSmsProvider implements SmsProvider {
  private readonly logger = new Logger(ConsoleSmsProvider.name)

  async send(to: string, body: string): Promise<void> {
    this.logger.log(`SMS to ${to}: ${body}`)
  }
}
