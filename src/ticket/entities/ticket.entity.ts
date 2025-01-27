import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { Grade } from 'src/seat/types/grade.type';
import { Seat } from 'src/seat/entities/seat.entity';
import { TICKET_CONSTANT } from 'src/constants/ticket/ticket.constant';

@Entity({
  name: TICKET_CONSTANT.ENTITY.TICKET.NAME,
})
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  // 사용자 외래키 설정
  @Column({ type: 'int', name: TICKET_CONSTANT.ENTITY.COMMON.USER_ID })
  userId: number;

  // 좌석 외래키 설정
  @Column({ type: 'int', name: TICKET_CONSTANT.ENTITY.COMMON.SEAT_ID })
  seatId: number;

  // 공연 제목
  @Column({ type: 'varchar', nullable: false })
  title: string;

  // 공연 러닝타임
  @Column({ type: 'int', nullable: false })
  runningTime: number;

  // 공연 시간
  @Column({ type: 'datetime', nullable: false })
  date: Date;

  // 사용자 이름
  @Column({ type: 'varchar', nullable: false })
  userName: string;

  // 좌석 번호
  @Column({ type: 'int', nullable: false })
  seatNumber: number;

  // 좌석 등급
  @Column({ type: 'enum', enum: Grade, nullable: false })
  grade: Grade;

  // 좌석 가격
  @Column({ type: 'int', nullable: false })
  price: number;

  // 공연 장소
  @Column({ type: 'varchar', nullable: false })
  place: string;

  // 취소 여부
  @Column({ type: 'boolean', default: false })
  isCanceled: boolean = false;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 좌석 엔티티와 관계 설정
  @ManyToOne(() => Seat, (seat) => seat.ticket)
  @JoinColumn({ name: TICKET_CONSTANT.ENTITY.COMMON.SEAT_ID })
  seats: Seat;

  // 사용자 엔티티와 관계 설정
  @ManyToOne(() => User, (user) => user.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: TICKET_CONSTANT.ENTITY.COMMON.USER_ID })
  user: User;
}
