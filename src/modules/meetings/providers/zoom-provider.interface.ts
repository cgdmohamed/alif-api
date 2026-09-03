export const ZOOM_PROVIDER = Symbol('ZOOM_PROVIDER')

export type ZoomRole = 'host' | 'participant'

export interface ZoomJoinCredentials {
  sessionName: string
  token: string
  sdkKey: string
}

export interface ZoomProvider {
  /**
   * Picks the session name a meeting will use. The Zoom Video SDK has no
   * remote "create meeting" call — a session is created implicitly the
   * first time someone joins it with a valid token — so this is purely
   * local bookkeeping, not a network call.
   */
  createSession(topic: string, meetingId: string): Promise<{ sessionName: string }>

  /**
   * Mints a fresh, short-lived JWT authorizing this specific user to join
   * this specific session. Must be called again for every join attempt —
   * unlike the old static joinUrl model, Video SDK tokens expire.
   */
  generateJoinToken(sessionName: string, role: ZoomRole, userIdentity: string): Promise<ZoomJoinCredentials>

  /**
   * Cloud recording playback requires a separate Zoom Server-to-Server
   * OAuth app and the `recording.completed` webhook, neither of which is
   * wired up — returns null when unavailable rather than fabricating a URL.
   */
  getRecordingUrl(sessionName: string): Promise<string | null>
}
