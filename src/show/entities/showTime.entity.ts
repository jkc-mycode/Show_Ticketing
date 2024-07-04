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
import { ShowPlace } from './showPlace.entity';
import { Seat } from 'src/seat/entities/seat.entity';

@Entity({
  name: 'show_time',
})
export class ShowTime {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Column({ type: 'int', name: 'show_id' })
  showId: number;

  @Column({ type: 'datetime', nullable: false })
  showTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 공연 엔티티와 관계 설정
  @ManyToOne(() => Show, (show) => show.showTimes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @OneToOne(() => ShowPlace, (showPlace) => showPlace.showTime)
  showPlace: ShowPlace;

  @OneToMany(() => Seat, (seat) => seat.show)
  seats: Seat;
}
