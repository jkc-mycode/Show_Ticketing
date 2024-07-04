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
import { Show } from './show.entity';
import { ShowTime } from './showTime.entity';

@Entity({
  name: 'show_place',
})
export class ShowPlace {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Column({ type: 'int', name: 'show_id' })
  showId: number;

  // 공연 시간 외래키 설정
  @Column({ type: 'int', name: 'show_time_id' })
  showTimeId: number;

  @Column({ type: 'varchar', nullable: false })
  placeName: string;

  @Column({ type: 'int', nullable: false })
  totalSeat: number;

  @Column({ type: 'int', nullable: false })
  seatA: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  seatS: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  seatR: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  seatVip: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 공연 엔티티와 관계 설정
  @ManyToOne(() => Show, (show) => show.showPlace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  // 공연 시간 엔티티와 관계 설정
  @OneToOne(() => ShowTime, (showTime) => showTime.showPlace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_time_id' })
  showTime: ShowTime;
}
