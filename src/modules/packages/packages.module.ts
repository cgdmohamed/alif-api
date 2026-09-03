import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Package } from './package.entity'
import { School } from '../schools/school.entity'
import { PackagesService } from './packages.service'
import { PackagesController } from './packages.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Package, School])],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService, TypeOrmModule],
})
export class PackagesModule {}
