import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, Min } from 'class-validator'

export class CreateSessionDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsInt()
  @Min(1)
  durationMinutes: number
}
