import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { CreateSchoolDto } from './create-school.dto'
import { SchoolStatus } from '../school.entity'

export class UpdateSchoolDto extends PartialType(CreateSchoolDto) {
  @ApiProperty({ enum: SchoolStatus, required: false })
  @IsOptional()
  @IsEnum(SchoolStatus)
  status?: SchoolStatus
}
