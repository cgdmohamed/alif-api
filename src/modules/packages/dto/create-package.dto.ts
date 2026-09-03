import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsInt, IsString, Min } from 'class-validator'
import { PackageCycle } from '../package.entity'

export class CreatePackageDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsInt()
  @Min(0)
  price: number

  @ApiProperty({ enum: PackageCycle })
  @IsEnum(PackageCycle)
  cycle: PackageCycle

  @ApiProperty()
  @IsInt()
  @Min(1)
  maxStudents: number

  @ApiProperty()
  @IsInt()
  @Min(1)
  maxClasses: number

  @ApiProperty()
  @IsInt()
  @Min(1)
  storageGB: number

  @ApiProperty()
  @IsString()
  color: string

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  features: string[]
}
