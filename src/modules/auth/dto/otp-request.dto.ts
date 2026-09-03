import { ApiProperty } from '@nestjs/swagger'
import { IsPhoneNumber } from 'class-validator'

export class OtpRequestDto {
  @ApiProperty()
  @IsPhoneNumber()
  phone: string
}
