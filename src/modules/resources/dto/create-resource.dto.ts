import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsString, Min } from 'class-validator'
import { ResourceStage } from '../resource.entity'

export class CreateResourceDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  subject: string

  @ApiProperty({ enum: ResourceStage })
  @IsEnum(ResourceStage)
  stage: ResourceStage

  @ApiProperty()
  @IsString()
  program: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsString()
  requiredFeature: string

  @ApiProperty()
  @IsString()
  color: string

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  sessionsCount = 0

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  questionsIncluded = 0

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  contentItemsIncluded = 0
}
