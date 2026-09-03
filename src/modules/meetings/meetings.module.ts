import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Meeting } from './meeting.entity'
import { Recording } from '../recordings/recording.entity'
import { ContentBlock } from '../programs/content-block.entity'
import { MeetingsService } from './meetings.service'
import { MeetingsController } from './meetings.controller'
import { ZOOM_PROVIDER } from './providers/zoom-provider.interface'
import { MockZoomProvider } from './providers/mock-zoom.provider'
import { ZoomVideoSdkProvider } from './providers/zoom-video-sdk.provider'

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, Recording, ContentBlock]), JwtModule.register({})],
  controllers: [MeetingsController],
  providers: [
    MeetingsService,
    ZoomVideoSdkProvider,
    MockZoomProvider,
    {
      provide: ZOOM_PROVIDER,
      inject: [ConfigService, ZoomVideoSdkProvider, MockZoomProvider],
      useFactory: (config: ConfigService, real: ZoomVideoSdkProvider, mock: MockZoomProvider) =>
        config.get('ZOOM_SDK_KEY') && config.get('ZOOM_SDK_SECRET') ? real : mock,
    },
  ],
  exports: [MeetingsService, TypeOrmModule],
})
export class MeetingsModule {}
