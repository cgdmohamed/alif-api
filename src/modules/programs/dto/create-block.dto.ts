import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsString, Min, ValidateIf } from 'class-validator'
import { BlockType, DeliveryChannel, ExecutionMode } from '../content-block.entity'

export class CreateBlockDto {
  @ApiProperty({ enum: BlockType })
  @IsEnum(BlockType)
  type: BlockType

  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsInt()
  @Min(1)
  durationMinutes: number

  @ApiProperty({ enum: ExecutionMode, required: false })
  @ValidateIf((dto) => dto.type === BlockType.ACTIVITY)
  @IsEnum(ExecutionMode)
  executionMode?: ExecutionMode

  @ApiProperty({ enum: DeliveryChannel, required: false })
  @ValidateIf((dto) => dto.type === BlockType.ACTIVITY)
  @IsEnum(DeliveryChannel)
  deliveryChannel?: DeliveryChannel

  @ApiProperty({ required: false })
  @ValidateIf((dto) => dto.type === BlockType.ACTIVITY)
  @IsString()
  activityType?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instructionsText?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  materialsNeeded?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  trainerNotes?: string
}
