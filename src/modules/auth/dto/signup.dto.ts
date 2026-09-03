import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsPhoneNumber, IsString } from 'class-validator'

export enum SignupRole {
  STUDENT = 'student',
  PARENT = 'parent',
}

export class SignupDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsPhoneNumber()
  phone: string

  @ApiProperty({ enum: SignupRole })
  @IsEnum(SignupRole)
  role: SignupRole
}
