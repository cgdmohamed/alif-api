import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class GradeSubmissionDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(100)
  grade: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  teacherNote?: string
}
