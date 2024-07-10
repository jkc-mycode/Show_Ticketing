import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Show } from './show.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { SHOW_CONSTANT } from 'src/constants/show/show.constant';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SHOW_MESSAGE } from 'src/constants/show/show.message.constant';
import { Type } from 'class-transformer';

@Entity({
  name: 'show_schedule',
})
export class ShowSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Column({ type: 'int', name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  showId: number;

  @Column({ type: 'datetime', nullable: false })
  showTime: Date;

  /**
   * 공연 장소명
   * @example "공연 장소명 테스트"
   */
  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.PLACE_NAME.IS_NOT_EMPTY })
  @Column({ type: 'varchar', nullable: false })
  placeName: string;

  @Column({ type: 'int', nullable: false })
  totalSeat: number;

  /**
   * A 좌석 수
   * @example 10
   */
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.SEAT_A.IS_NOT_EMPTY })
  @Column({ type: 'int', nullable: false })
  seatA: number;

  /**
   * S 좌석 수
   * @example 7
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Column({ type: 'int', nullable: true, default: 0 })
  seatS: number;

  /**
   * R 좌석 수
   * @example 5
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Column({ type: 'int', nullable: true, default: 0 })
  seatR: number;

  /**
   * Vip 좌석 수
   * @example 2
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Column({ type: 'int', nullable: true, default: 0 })
  seatVip: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 공연 엔티티와 관계 설정
  @ManyToOne(() => Show, (show) => show.showSchedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  show: Show;

  @OneToMany(() => Seat, (seat) => seat.showSchedule, { cascade: true })
  seats: Seat[];
}
