export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER')

export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<void>
}
