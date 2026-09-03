import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator'
import { CreateResourceDto } from './create-resource.dto'
import { ResourceStatus } from '../resource.entity'

export class UpdateResourceDto extends PartialType(CreateResourceDto) {
  @ApiProperty({ enum: ResourceStatus, required: false })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus

  @ApiProperty({ required: false, description: 'Bump when publishing a revised version of this resource' })
  @IsOptional()
  @IsInt()
  @Min(1)
  versionNumber?: number
}
