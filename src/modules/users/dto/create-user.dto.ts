import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator'
import { Role } from '../../../common/enums/role.enum'

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string

  @ApiProperty({ required: false, description: 'Required for roles that log in with email+password' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  schoolId?: string
}
