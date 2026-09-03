import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { AssignmentKind } from '../assignment.entity'

export class CreateAssignmentDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty({ enum: AssignmentKind })
  @IsEnum(AssignmentKind)
  kind: AssignmentKind

  @ApiProperty()
  @IsDateString()
  dueAt: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  blockId?: string
}
