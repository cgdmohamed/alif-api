import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProgramDay } from './program-day.entity'
import { Unit } from './unit.entity'
import { SessionNode } from './session-node.entity'
import { ContentBlock } from './content-block.entity'
import { ProgramsService } from './programs.service'
import { ProgramsController } from './programs.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ProgramDay, Unit, SessionNode, ContentBlock])],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService, TypeOrmModule],
})
export class ProgramsModule {}
