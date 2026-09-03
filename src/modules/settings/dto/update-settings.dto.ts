import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsObject, IsOptional, IsString } from 'class-validator'

export class UpdateSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  platformName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  officialEmail?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  security?: { minPasswordLength: number; sessionMinutes: number; twoFactorEnabled: boolean }

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  zoom?: { accountId: string | null }

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  smtp?: { host: string | null; port: number | null; encryption: string | null }

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  sms?: { gateway: string | null; senderName: string | null }

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  storageAutoCleanup?: boolean
}
