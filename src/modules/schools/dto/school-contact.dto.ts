import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class SchoolContactDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  role: string

  @ApiProperty()
  @IsString()
  phone: string

  @ApiProperty()
  @IsEmail()
  email: string
}
