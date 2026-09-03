import { Injectable, Logger } from '@nestjs/common'
import type { OtpSender } from './otp-sender.interface'

/**
 * Dev/local stand-in for a real SMS gateway. Swap the provider binding in
 * AuthModule for a real implementation once SMS credentials exist.
 */
@Injectable()
export class ConsoleOtpSender implements OtpSender {
  private readonly logger = new Logger(ConsoleOtpSender.name)

  async send(phone: string, code: string): Promise<void> {
    this.logger.log(`OTP for ${phone}: ${code}`)
  }
}
