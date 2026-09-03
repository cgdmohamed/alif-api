import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class CreateMeetingDto {
  @ApiProperty()
  @IsString()
  classId: string

  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsDateString()
  scheduledAt: string

  @ApiProperty()
  @IsInt()
  @Min(1)
  durationMinutes: number

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sessionPlanBlockIds?: string[]
}
