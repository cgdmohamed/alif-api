export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER')

export interface StorageProvider {
  /** Returns a publicly reachable URL for the stored object. */
  save(key: string, data: Buffer): Promise<string>
  delete(key: string): Promise<void>
}
