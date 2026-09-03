import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class ParentConsentDto {
  @ApiProperty({ description: 'The student user id awaiting parental consent' })
  @IsString()
  studentId: string
}
