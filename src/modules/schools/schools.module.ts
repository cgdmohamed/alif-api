import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { School } from './school.entity'
import { SchoolContact } from './school-contact.entity'
import { SchoolApproval } from './school-approval.entity'
import { SchoolInvoice } from './school-invoice.entity'
import { SchoolsService } from './schools.service'
import { SchoolsController } from './schools.controller'
import { PackagesModule } from '../packages/packages.module'
import { ActivityLogModule } from '../activity-log/activity-log.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([School, SchoolContact, SchoolApproval, SchoolInvoice]),
    PackagesModule,
    ActivityLogModule,
  ],
  controllers: [SchoolsController],
  providers: [SchoolsService],
  exports: [SchoolsService, TypeOrmModule],
})
export class SchoolsModule {}
