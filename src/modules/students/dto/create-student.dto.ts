import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString } from 'class-validator'

export class CreateStudentDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stage?: string

  @ApiProperty()
  @IsString()
  className: string

  @ApiProperty()
  @IsString()
  parentName: string

  @ApiProperty()
  @IsEmail()
  parentEmail: string

  @ApiProperty()
  @IsEmail()
  studentEmail: string
}
