import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator'

class InitialMeetingDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsString()
  date: string

  @ApiProperty()
  @IsString()
  time: string
}

export class CreateClassDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resourceId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  teacherId?: string

  @ApiProperty()
  @IsString()
  color: string

  @ApiProperty({ default: true })
  @IsBoolean()
  autoAgora: boolean

  @ApiProperty({ type: [InitialMeetingDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialMeetingDto)
  initialMeetings?: InitialMeetingDto[]
}
