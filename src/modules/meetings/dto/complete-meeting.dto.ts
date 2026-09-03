import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator'

export class CompleteMeetingDto {
  @ApiProperty({ type: 'object', additionalProperties: { type: 'boolean' } })
  @IsObject()
  checklist: Record<string, boolean>

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string
}
