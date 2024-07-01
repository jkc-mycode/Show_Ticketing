import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'refresh_token',
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
}
