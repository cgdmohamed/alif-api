import { ApiProperty } from '@nestjs/swagger'
import { IsPhoneNumber, IsString, Length } from 'class-validator'

export class OtpVerifyDto {
  @ApiProperty()
  @IsPhoneNumber()
  phone: string

  @ApiProperty()
  @IsString()
  @Length(4, 8)
  code: string
}
