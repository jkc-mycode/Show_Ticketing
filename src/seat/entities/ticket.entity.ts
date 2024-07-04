import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Grade } from '../types/grade.type';
import { Seat } from './seat.entity';
import { User } from 'src/user/entities/user.entity';

@Entity({
  name: 'ticket',
})
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  // 사용자 외래키 설정
  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  // 좌석 외래키 설정
  @Column({ type: 'int', name: 'seat_id' })
  seatId: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'int', nullable: false })
  runningTime: number;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column({ type: 'varchar', nullable: false })
  userName: string;

  @Column({ type: 'int', nullable: false })
  seatNumber: number;

  @Column({ type: 'enum', enum: Grade, nullable: false })
  grade: Grade;

  @Column({ type: 'int', nullable: false })
  price: number;

  @Column({ type: 'varchar', nullable: false })
  place: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 좌석 엔티티와 관계 설정
  @OneToOne(() => Seat, (seat) => seat.ticket)
  @JoinColumn({ name: 'seat_id' })
  seats: Seat;

  // 사용자 엔티티와 관계 설정
  @ManyToOne(() => User, (user) => user.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  user: User;
}
