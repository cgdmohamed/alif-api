import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export enum PackageCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
}

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ type: 'int' })
  price: number

  @Column({ type: 'enum', enum: PackageCycle })
  cycle: PackageCycle

  @Column({ type: 'int' })
  maxStudents: number

  @Column({ type: 'int' })
  maxClasses: number

  @Column({ type: 'int' })
  storageGB: number

  @Column()
  color: string

  @Column('text', { array: true, default: () => "'{}'" })
  features: string[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
