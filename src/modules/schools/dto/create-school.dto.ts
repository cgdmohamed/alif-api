import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator'
import { SchoolContactDto } from './school-contact.dto'

export class CreateSchoolDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  city: string

  @ApiProperty()
  @IsString()
  type: string

  @ApiProperty()
  @IsString()
  principal: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  packageId?: string

  @ApiProperty({ type: [SchoolContactDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SchoolContactDto)
  contacts?: SchoolContactDto[]
}
