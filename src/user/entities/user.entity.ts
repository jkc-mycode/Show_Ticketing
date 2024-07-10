import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Role } from '../types/user-role.type';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { USER_CONSTANT } from 'src/constants/user/user.constant';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AUTH_MESSAGE } from 'src/constants/auth/auth.message.constant';

@Index('email', ['email'], { unique: true })
@Entity({
  name: 'user',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 이메일
   * @example "sparta@sparta.com"
   */
  @IsEmail()
  @IsNotEmpty({ message: AUTH_MESSAGE.DTO.EMAIL.IS_NOT_EMPTY })
  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  /**
   * 비밀번호
   * @example "123123"
   */
  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGE.DTO.PASSWORD.IS_NOT_EMPTY })
  @Column({ type: 'varchar', select: false, nullable: false })
  password: string;

  /**
   * 닉네임
   * @example "스파르타"
   */
  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGE.DTO.NICKNAME.IS_NOT_EMPTY })
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

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken: RefreshToken;

  @OneToMany(() => Ticket, (tickets) => tickets.user)
  tickets: Ticket[];
}
