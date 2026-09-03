import { ApiProperty } from '@nestjs/swagger'
import { IsObject } from 'class-validator'

export class SubmitAssignmentDto {
  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  answerPayload: Record<string, unknown>
}
