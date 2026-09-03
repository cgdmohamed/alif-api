import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { CreateClassDto } from './create-class.dto'
import { ClassStatus } from '../class.entity'

export class UpdateClassDto extends PartialType(CreateClassDto) {
  @ApiProperty({ enum: ClassStatus, required: false })
  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus
}
