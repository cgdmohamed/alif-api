import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import type { AgoraProvider, AgoraJoinCredentials } from './agora-provider.interface'

/**
 * Dev/local stand-in used when AGORA_APP_ID/AGORA_APP_CERTIFICATE aren't
 * configured — see MeetingsModule for the real AgoraRtcProvider binding.
 */
@Injectable()
export class MockAgoraProvider implements AgoraProvider {
  async createSession(topic: string, meetingId: string): Promise<{ channelName: string }> {
    return { channelName: `mock-${meetingId}` }
  }

  async generateJoinToken(channelName: string): Promise<AgoraJoinCredentials> {
    return {
      channelName,
      token: `mock.${crypto.randomBytes(12).toString('hex')}`,
      appId: 'mock-app-id',
      uid: 0,
    }
  }

  async getRecordingUrl(channelName: string): Promise<string | null> {
    // Mock provider stays fully fake so local dev/demo flows (e.g. the
    // recordings library) still populate without real Agora credentials.
    return `https://agora.mock/recording/${channelName}`
  }
}
