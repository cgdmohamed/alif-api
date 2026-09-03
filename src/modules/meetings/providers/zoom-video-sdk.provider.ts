import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import type { ZoomProvider, ZoomJoinCredentials, ZoomRole } from './zoom-provider.interface'

const TOKEN_TTL_SECONDS = 2 * 60 * 60 // 2 hours — within Zoom's 30min-48h bound

/**
 * Real Zoom Video SDK integration (https://github.com/zoom/videosdk-flutter-quickstart,
 * https://github.com/zoom/videosdk-auth-endpoint-sample). The Video SDK — not the
 * Meeting SDK — is the right fit here since the app renders its own fully custom
 * meeting UI rather than embedding Zoom's own meeting screen.
 *
 * Unlike the old Meetings-REST-API model, there is no "create meeting" call: a
 * session comes into existence the first time a participant joins it with a
 * valid signed JWT, and that JWT must be (re-)minted per join attempt since it
 * carries a role and an expiry.
 */
@Injectable()
export class ZoomVideoSdkProvider implements ZoomProvider {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async createSession(topic: string, meetingId: string): Promise<{ sessionName: string }> {
    // Session names are just identifiers we choose — keep them unique and
    // stable per meeting so rejoining resolves to the same session.
    return { sessionName: `alef-${meetingId}` }
  }

  async generateJoinToken(sessionName: string, role: ZoomRole, userIdentity: string): Promise<ZoomJoinCredentials> {
    const sdkKey = this.config.get<string>('ZOOM_SDK_KEY')
    const sdkSecret = this.config.get<string>('ZOOM_SDK_SECRET')
    if (!sdkKey || !sdkSecret) {
      throw new Error('ZOOM_SDK_KEY/ZOOM_SDK_SECRET are not configured')
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      app_key: sdkKey,
      tpc: sessionName,
      role_type: role === 'host' ? 1 : 0,
      user_identity: userIdentity,
      version: 1,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    }

    const token = this.jwtService.sign(payload, { secret: sdkSecret, algorithm: 'HS256' })
    return { sessionName, token, sdkKey }
  }

  async getRecordingUrl(): Promise<string | null> {
    // Requires a separate Server-to-Server OAuth Zoom app and the
    // recording.completed webhook — not wired up. Returning null keeps
    // recording state honest instead of fabricating a URL.
    return null
  }
}
