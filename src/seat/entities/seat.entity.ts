import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Grade } from '../types/grade.type';
import { Show } from 'src/show/entities/show.entity';
import { ShowTime } from 'src/show/entities/showTime.entity';
import { Ticket } from './ticket.entity';

@Entity({
  name: 'seat',
})
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Index()
  @Column({ type: 'int', name: 'show_id' })
  showId: number;

  // 공연 시간 외래키 설정
  @Index()
  @Column({ type: 'int', name: 'show_time_id' })
  showTimeId: number;

  @Column({ type: 'int', nullable: false })
  seatNumber: number;

  @Column({ type: 'enum', enum: Grade, nullable: false })
  grade: Grade;

  @Column({ type: 'int', nullable: false })
  price: number;

  @Column({ type: 'boolean', default: false })
  isReserved: boolean = false;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 공연 엔티티와 관계 설정
  @ManyToOne(() => Show, (show) => show.seats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  // 공연 시간 엔티티와 관계 설정
  @ManyToOne(() => ShowTime, (showTime) => showTime.seats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_time_id' })
  showTime: ShowTime;

  @OneToOne(() => Ticket, (ticket) => ticket.seats)
  ticket: Ticket;
}
