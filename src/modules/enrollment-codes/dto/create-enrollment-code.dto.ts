import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsInt, IsString, Min } from 'class-validator'
import { EnrollmentCodeType } from '../enrollment-code.entity'

export class CreateEnrollmentCodeDto {
  @ApiProperty()
  @IsString()
  classId: string

  @ApiProperty({ enum: EnrollmentCodeType })
  @IsEnum(EnrollmentCodeType)
  codeType: EnrollmentCodeType

  @ApiProperty()
  @IsInt()
  @Min(1)
  maxUses: number

  @ApiProperty()
  @IsDateString()
  expiresAt: string
}
