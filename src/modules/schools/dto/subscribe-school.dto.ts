import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class SubscribeSchoolDto {
  @ApiProperty()
  @IsString()
  packageId: string
}
