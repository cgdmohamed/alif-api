import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Meeting } from './meeting.entity'
import { Recording } from '../recordings/recording.entity'
import { ContentBlock } from '../programs/content-block.entity'
import { MeetingsService } from './meetings.service'
import { MeetingsController } from './meetings.controller'
import { AGORA_PROVIDER } from './providers/agora-provider.interface'
import { MockAgoraProvider } from './providers/mock-agora.provider'
import { AgoraRtcProvider } from './providers/agora-rtc.provider'

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, Recording, ContentBlock])],
  controllers: [MeetingsController],
  providers: [
    MeetingsService,
    AgoraRtcProvider,
    MockAgoraProvider,
    {
      provide: AGORA_PROVIDER,
      inject: [ConfigService, AgoraRtcProvider, MockAgoraProvider],
      useFactory: (config: ConfigService, real: AgoraRtcProvider, mock: MockAgoraProvider) =>
        config.get('AGORA_APP_ID') && config.get('AGORA_APP_CERTIFICATE') ? real : mock,
    },
  ],
  exports: [MeetingsService, TypeOrmModule],
})
export class MeetingsModule {}
