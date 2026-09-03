import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'

export class TestConnectionDto {
  @ApiProperty({ enum: ['zoom', 'smtp', 'sms'] })
  @IsIn(['zoom', 'smtp', 'sms'])
  target: 'zoom' | 'smtp' | 'sms'
}
