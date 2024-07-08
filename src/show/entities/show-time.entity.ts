import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Show } from './show.entity';
import { ShowPlace } from './show-place.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { SHOW_CONSTANT } from 'src/constants/show/show.constant';

@Entity({
  name: SHOW_CONSTANT.ENTITY.SHOW_TIME.NAME,
})
export class ShowTime {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Column({ type: 'int', name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  showId: number;

  @Column({ type: 'datetime', nullable: false })
  showTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 공연 엔티티와 관계 설정
  @ManyToOne(() => Show, (show) => show.showTimes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  show: Show;

  @OneToOne(() => ShowPlace, (showPlace) => showPlace.showTime)
  showPlace: ShowPlace;

  @OneToMany(() => Seat, (seat) => seat.show)
  seats: Seat;
}
