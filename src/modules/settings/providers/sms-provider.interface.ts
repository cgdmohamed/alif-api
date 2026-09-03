export const SMS_PROVIDER = Symbol('SMS_PROVIDER')

export interface SmsProvider {
  send(to: string, body: string): Promise<void>
}
