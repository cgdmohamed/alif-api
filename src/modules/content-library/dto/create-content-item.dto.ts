import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator'
import { ContentItemType } from '../content-item.entity'

export class CreateContentItemDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty({ enum: ContentItemType })
  @IsEnum(ContentItemType)
  type: ContentItemType

  @ApiProperty()
  @IsString()
  color: string

  @ApiProperty()
  @IsString()
  folder: string

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? [] : Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  tags: string[] = []
}
