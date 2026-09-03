import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { CreateUserDto } from './create-user.dto'
import { UserStatus } from '../user.entity'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus
}
