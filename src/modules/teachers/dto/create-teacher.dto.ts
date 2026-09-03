import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class CreateTeacherDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  specialty: string

  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  phone: string
}
