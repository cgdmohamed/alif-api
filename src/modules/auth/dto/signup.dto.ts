import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from "class-validator";

export enum SignupRole {
  STUDENT = "student",
  PARENT = "parent",
}

export class SignupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Login identifier — OTP codes are sent here" })
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ enum: SignupRole })
  @IsEnum(SignupRole)
  role: SignupRole;

  @ApiPropertyOptional({
    description: "School-issued enrollment code used by mobile student signup",
  })
  @IsOptional()
  @IsString()
  enrollmentCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  parentPhone?: string;
}
