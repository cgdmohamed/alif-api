import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateDayDto {
  @ApiProperty()
  @IsString()
  title: string
}
