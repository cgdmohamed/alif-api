import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RtcTokenBuilder, RtcRole } from 'agora-token'
import type { AgoraProvider, AgoraJoinCredentials } from './agora-provider.interface'

const TOKEN_TTL_SECONDS = 2 * 60 * 60 // 2 hours

/**
 * Real Agora integration (https://docs.agora.io/en/video-calling/get-started/authentication-workflow,
 * npm package "agora-token"). Replaces the earlier Zoom Video SDK provider —
 * same shape (server mints a fresh, short-lived join token per attempt; no
 * remote "create channel" call, a channel exists implicitly on first join).
 *
 * Uses a wildcard uid (0) for every token/join: everyone in a class meeting
 * needs full publish rights (Agora's Role only meaningfully restricts
 * publishing in the "live broadcasting" channel profile, and this app uses
 * "communication"), so there's no host/participant distinction to encode —
 * unlike Zoom's role_type, Agora's PUBLISHER role is requested uniformly.
 */
@Injectable()
export class AgoraRtcProvider implements AgoraProvider {
  constructor(private readonly config: ConfigService) {}

  async createSession(topic: string, meetingId: string): Promise<{ channelName: string }> {
    return { channelName: `alef-${meetingId}` }
  }

  async generateJoinToken(channelName: string): Promise<AgoraJoinCredentials> {
    const appId = this.config.get<string>('AGORA_APP_ID')
    const appCertificate = this.config.get<string>('AGORA_APP_CERTIFICATE')
    if (!appId || !appCertificate) {
      throw new Error('AGORA_APP_ID/AGORA_APP_CERTIFICATE are not configured')
    }

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      0, // wildcard uid — see class doc
      RtcRole.PUBLISHER,
      TOKEN_TTL_SECONDS,
      TOKEN_TTL_SECONDS,
    )

    return { channelName, token, appId, uid: 0 }
  }

  async getRecordingUrl(): Promise<string | null> {
    // Requires Agora's separate Cloud Recording REST API — not wired up.
    // Returning null keeps recording state honest instead of fabricating a URL.
    return null
  }
}
