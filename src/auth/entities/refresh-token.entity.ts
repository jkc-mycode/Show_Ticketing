import { AUTH_CONSTANT } from 'src/constants/auth/auth.constant';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: AUTH_CONSTANT.ENTITY.NAME,
})
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true, nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: false })
  token: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 사용자 엔티티와 관계 설정
  @OneToOne(() => User, (user) => user.refreshToken, { onDelete: 'CASCADE' })
  @JoinColumn({ name: AUTH_CONSTANT.ENTITY.USER_ID })
  user: User;
}
