import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm'

/** Single-row table — always read/written via id 'singleton'. */
@Entity('platform_settings')
export class PlatformSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ default: 'ألف المستقبل' })
  platformName: string

  @Column({ type: 'varchar', nullable: true })
  officialEmail: string | null

  @Column({ type: 'varchar', nullable: true })
  logoUrl: string | null

  @Column('jsonb', { default: () => "'{}'" })
  security: { minPasswordLength: number; sessionMinutes: number; twoFactorEnabled: boolean }

  @Column('jsonb', { default: () => "'{}'" })
  zoom: { accountId: string | null }

  @Column('jsonb', { default: () => "'{}'" })
  smtp: { host: string | null; port: number | null; encryption: string | null }

  @Column('jsonb', { default: () => "'{}'" })
  sms: { gateway: string | null; senderName: string | null }

  @Column({ default: false })
  storageAutoCleanup: boolean

  @UpdateDateColumn()
  updatedAt: Date
}
