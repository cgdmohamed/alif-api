import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class AddMeetingDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsString()
  date: string

  @ApiProperty()
  @IsString()
  time: string
}
