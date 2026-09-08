import { ForbiddenException } from '@nestjs/common'
import { Role } from '../enums/role.enum'

export interface AuthUser {
  id: string
  role: Role
  schoolId: string | null
}

export function assertSchoolAccess(user: AuthUser, schoolId: string) {
  if (user.role === Role.PLATFORM_ADMIN) return
  if (!user.schoolId || user.schoolId !== schoolId) {
    throw new ForbiddenException('You do not have access to this school')
  }
}
