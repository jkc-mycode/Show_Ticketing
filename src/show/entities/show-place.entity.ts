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
import { ShowTime } from './show-time.entity';
import { SHOW_CONSTANT } from 'src/constants/show/show.constant';

@Entity({
  name: SHOW_CONSTANT.ENTITY.SHOW_PLACE.NAME,
})
export class ShowPlace {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Column({ type: 'int', name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  showId: number;

  // 공연 시간 외래키 설정
  @Column({ type: 'int', name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_TIME_ID })
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
  @JoinColumn({ name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  show: Show;

  // 공연 시간 엔티티와 관계 설정
  @OneToOne(() => ShowTime, (showTime) => showTime.showPlace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_TIME_ID })
  showTime: ShowTime;
}
