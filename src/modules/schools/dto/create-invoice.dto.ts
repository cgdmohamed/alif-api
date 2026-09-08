import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsInt, Min } from 'class-validator'

export class CreateInvoiceDto {
  @ApiProperty()
  @IsDateString()
  issuedAt: string

  @ApiProperty()
  @IsInt()
  @Min(0)
  amount: number
}
