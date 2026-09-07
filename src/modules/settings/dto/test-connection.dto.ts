import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'

export class TestConnectionDto {
  @ApiProperty({ enum: ['agora', 'smtp', 'sms'] })
  @IsIn(['agora', 'smtp', 'sms'])
  target: 'agora' | 'smtp' | 'sms'
}
