import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { AttendanceStatus } from '../attendance.entity'

class AttendanceEntryDto {
  @ApiProperty()
  @IsUUID()
  studentId: string

  @ApiProperty({ enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string
}

export class MarkAttendanceDto {
  @ApiProperty({ type: [AttendanceEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceEntryDto)
  entries: AttendanceEntryDto[]
}
