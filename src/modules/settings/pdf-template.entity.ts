import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm'

@Entity('pdf_templates')
export class PdfTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ type: 'varchar', nullable: true })
  storageUrl: string | null

  @UpdateDateColumn()
  updatedAt: Date
}
