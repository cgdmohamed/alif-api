import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateUnitDto {
  @ApiProperty()
  @IsString()
  title: string
}
