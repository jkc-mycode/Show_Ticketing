import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Role } from '../types/user-role.type';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { USER_CONSTANT } from 'src/constants/user/user.constant';

@Index('email', ['email'], { unique: true })
@Entity({
  name: 'user',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', select: false, nullable: false })
  password: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  nickname: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ type: 'int', default: USER_CONSTANT.ENTITY.DEFAULT_POINT })
  point: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Ticket, (tickets) => tickets.user)
  tickets: Ticket[];
}
