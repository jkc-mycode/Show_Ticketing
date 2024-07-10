import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Grade } from '../types/grade.type';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { SEAT_CONSTANT } from 'src/constants/seat/seat.constant';
import { ShowSchedule } from 'src/show/entities/show-schedule.entity';

@Entity({
  name: SEAT_CONSTANT.ENTITY.NAME,
})
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Index()
  @Column({ type: 'int', name: SEAT_CONSTANT.ENTITY.SHOW_ID })
  showId: number;

  // 공연 시간 외래키 설정
  @Index()
  @Column({ type: 'int', name: 'show_schedule_id' })
  showScheduleId: number;

  // 좌석 번호
  @Column({ type: 'int', nullable: false })
  seatNumber: number;

  // 좌석 등급
  @Column({ type: 'enum', enum: Grade, nullable: false })
  grade: Grade;

  // 좌석 가격
  @Column({ type: 'int', nullable: false })
  price: number;

  // 예약 여부
  @Column({ type: 'boolean', default: false })
  isReserved: boolean = false;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 공연 엔티티와 관계 설정
  // @ManyToOne(() => Show, (show) => show.seats, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: SEAT_CONSTANT.ENTITY.SHOW_ID })
  // show: Show;

  // 공연 일정 엔티티와 관계 설정
  @ManyToOne(() => ShowSchedule, (showSchedule) => showSchedule.seats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_schedule_id' })
  showSchedule: ShowSchedule;

  // 티켓 엔티티와 관계 설정
  @OneToMany(() => Ticket, (ticket) => ticket.seats)
  ticket: Ticket[];
}
