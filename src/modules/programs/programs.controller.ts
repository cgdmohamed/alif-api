import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ProgramsService } from './programs.service'
import { CreateDayDto } from './dto/create-day.dto'
import { CreateUnitDto } from './dto/create-unit.dto'
import { CreateSessionDto } from './dto/create-session.dto'
import { CreateBlockDto } from './dto/create-block.dto'
import { UpdateBlockDto } from './dto/update-block.dto'
import { Public } from '../../common/decorators/public.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '../../common/enums/role.enum'

@ApiTags('programs')
@ApiBearerAuth()
@Controller()
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Public()
  @Get('resources/:resourceId/program')
  getTree(@Param('resourceId') resourceId: string) {
    return this.programsService.getTree(resourceId)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Post('programs/:resourceId/days')
  addDay(@Param('resourceId') resourceId: string, @Body() dto: CreateDayDto) {
    return this.programsService.addDay(resourceId, dto)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Patch('days/:id')
  updateDay(@Param('id') id: string, @Body() dto: CreateDayDto) {
    return this.programsService.updateDay(id, dto)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Post('days/:dayId/units')
  addUnit(@Param('dayId') dayId: string, @Body() dto: CreateUnitDto) {
    return this.programsService.addUnit(dayId, dto)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Patch('units/:id')
  updateUnit(@Param('id') id: string, @Body() dto: CreateUnitDto) {
    return this.programsService.updateUnit(id, dto)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Post('units/:unitId/sessions')
  addSession(@Param('unitId') unitId: string, @Body() dto: CreateSessionDto) {
    return this.programsService.addSession(unitId, dto)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Patch('sessions/:id')
  updateSession(@Param('id') id: string, @Body() dto: CreateSessionDto) {
    return this.programsService.updateSession(id, dto)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Post('sessions/:sessionId/blocks')
  addBlock(@Param('sessionId') sessionId: string, @Body() dto: CreateBlockDto) {
    return this.programsService.addBlock(sessionId, dto)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Patch('blocks/:id')
  updateBlock(@Param('id') id: string, @Body() dto: UpdateBlockDto) {
    return this.programsService.updateBlock(id, dto)
  }

  @Roles(Role.PLATFORM_ADMIN)
  @Delete('blocks/:id')
  removeBlock(@Param('id') id: string) {
    return this.programsService.removeBlock(id)
  }
}
