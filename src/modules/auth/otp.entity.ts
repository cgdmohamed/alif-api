import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('otp_codes')
export class OtpCode {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  email: string

  @Column()
  codeHash: string

  @Column()
  expiresAt: Date

  @Column({ default: 0 })
  attempts: number

  @Column({ default: false })
  consumed: boolean

  @CreateDateColumn()
  createdAt: Date
}
