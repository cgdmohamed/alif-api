export const OTP_SENDER = Symbol('OTP_SENDER')

export interface OtpSender {
  send(email: string, code: string): Promise<void>
}
