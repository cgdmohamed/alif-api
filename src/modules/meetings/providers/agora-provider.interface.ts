export const AGORA_PROVIDER = Symbol('AGORA_PROVIDER')

export interface AgoraJoinCredentials {
  channelName: string
  token: string
  appId: string
  /**
   * Always 0 ("wildcard" uid) — the token authorizes any numeric uid, and
   * each client lets the Agora SDK assign its own uid on join rather than
   * us tracking one per user. Simpler and avoids a uid<->user mapping step.
   */
  uid: number
}

export interface AgoraProvider {
  /**
   * Picks the channel name a meeting will use. Agora has no remote
   * "create channel" call — like the Video SDK before it, a channel exists
   * implicitly the first time someone joins it with a valid token.
   */
  createSession(topic: string, meetingId: string): Promise<{ channelName: string }>

  /**
   * Mints a fresh, short-lived token authorizing a join to this channel.
   * Must be called again for every join attempt — tokens expire.
   */
  generateJoinToken(channelName: string): Promise<AgoraJoinCredentials>

  /**
   * Cloud recording requires Agora's separate Cloud Recording REST API
   * (start/stop/query calls against a recording resource, plus storage
   * config) — not wired up. Returns null when unavailable rather than
   * fabricating a URL.
   */
  getRecordingUrl(channelName: string): Promise<string | null>
}
