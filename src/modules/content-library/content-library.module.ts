import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContentItem } from './content-item.entity'
import { ContentLibraryService } from './content-library.service'
import { ContentLibraryController } from './content-library.controller'
import { STORAGE_PROVIDER } from '../../common/storage/storage-provider.interface'
import { LocalStorageProvider } from '../../common/storage/local-storage.provider'

@Module({
  imports: [TypeOrmModule.forFeature([ContentItem])],
  controllers: [ContentLibraryController],
  providers: [ContentLibraryService, { provide: STORAGE_PROVIDER, useClass: LocalStorageProvider }],
  exports: [ContentLibraryService],
})
export class ContentLibraryModule {}
