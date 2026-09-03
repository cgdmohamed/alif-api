import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { User } from '../users/user.entity'

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  userId: string

  /**
   * SHA-256 hex digest of the raw refresh token. Refresh tokens are
   * high-entropy random values (not low-entropy secrets like passwords), so
   * a deterministic digest is safe here and — unlike bcrypt — supports an
   * indexed equality lookup instead of scanning every live token.
   */
  @Index()
  @Column()
  tokenHash: string

  @Column()
  expiresAt: Date

  @Column({ default: false })
  revoked: boolean

  @CreateDateColumn()
  createdAt: Date
}
