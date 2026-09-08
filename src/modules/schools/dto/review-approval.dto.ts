import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'
import { ApprovalStatus } from '../school-approval.entity'

export class ReviewApprovalDto {
  @ApiProperty({ enum: [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED] })
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus.APPROVED | ApprovalStatus.REJECTED
}
