import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class TransferConversationDto {
  @ApiProperty()
  @IsString()
  agentId: string
}
