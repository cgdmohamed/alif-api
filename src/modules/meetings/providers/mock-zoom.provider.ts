import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import type { ZoomProvider, ZoomJoinCredentials, ZoomRole } from './zoom-provider.interface'

/**
 * Dev/local stand-in used when ZOOM_SDK_KEY/ZOOM_SDK_SECRET aren't
 * configured — see MeetingsModule for the real ZoomVideoSdkProvider binding.
 */
@Injectable()
export class MockZoomProvider implements ZoomProvider {
  async createSession(topic: string, meetingId: string): Promise<{ sessionName: string }> {
    return { sessionName: `mock-${meetingId}` }
  }

  async generateJoinToken(sessionName: string, role: ZoomRole, userIdentity: string): Promise<ZoomJoinCredentials> {
    return {
      sessionName,
      token: `mock.${crypto.randomBytes(12).toString('hex')}.${role}.${userIdentity}`,
      sdkKey: 'mock-sdk-key',
    }
  }

  async getRecordingUrl(sessionName: string): Promise<string | null> {
    // Mock provider stays fully fake so local dev/demo flows (e.g. the
    // recordings library) still populate without real Zoom credentials.
    return `https://zoom.mock/recording/${sessionName}`
  }
}
