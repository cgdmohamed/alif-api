import { Injectable } from '@nestjs/common'
import * as fs from 'fs/promises'
import * as path from 'path'
import type { StorageProvider } from './storage-provider.interface'

/**
 * Dev/local stand-in for a real object store (S3, GCS, ...). Swap the
 * provider binding for a real implementation once storage credentials exist.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly root = path.join(process.cwd(), 'uploads')

  async save(key: string, data: Buffer): Promise<string> {
    const filePath = path.join(this.root, key)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, data)
    return `/uploads/${key}`
  }

  async delete(key: string): Promise<void> {
    await fs.rm(path.join(this.root, key), { force: true })
  }
}
