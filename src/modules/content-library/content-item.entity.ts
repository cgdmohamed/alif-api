import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

export enum ContentItemType {
  VIDEO = 'video',
  PDF = 'pdf',
  IMAGE = 'image',
  ACTIVITY = 'activity',
}

@Entity('content_items')
export class ContentItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column({ type: 'enum', enum: ContentItemType })
  type: ContentItemType

  @Column({ type: 'bigint', default: 0 })
  sizeBytes: number

  @Column()
  storageUrl: string

  @Column()
  color: string

  @Column()
  folder: string

  @Column('text', { array: true, default: () => "'{}'" })
  tags: string[]

  @CreateDateColumn()
  createdAt: Date
}
