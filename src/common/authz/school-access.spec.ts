import { ForbiddenException } from '@nestjs/common'
import { assertSchoolAccess } from './school-access'
import { Role } from '../enums/role.enum'

describe('assertSchoolAccess', () => {
  it('allows a platform admin to access any school', () => {
    expect(() => assertSchoolAccess({ id: 'admin', role: Role.PLATFORM_ADMIN, schoolId: null }, 'school-2')).not.toThrow()
  })

  it('allows a school user only into their own school', () => {
    const user = { id: 'teacher', role: Role.TEACHER, schoolId: 'school-1' }
    expect(() => assertSchoolAccess(user, 'school-1')).not.toThrow()
    expect(() => assertSchoolAccess(user, 'school-2')).toThrow(ForbiddenException)
  })
})
