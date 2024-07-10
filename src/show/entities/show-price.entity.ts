import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Show } from './show.entity';
import { SHOW_CONSTANT } from 'src/constants/show/show.constant';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Max } from 'class-validator';
import { SHOW_MESSAGE } from 'src/constants/show/show.message.constant';

@Entity({
  name: SHOW_CONSTANT.ENTITY.SHOW_PRICE.NAME,
})
export class ShowPrice {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Column({ type: 'int', name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  showId: number;

  /**
   * A 좌석 가격
   * @example 1000
   */
  @Type(() => Number)
  @IsNumber()
  @Max(SHOW_CONSTANT.DTO.MAX_PRICE, { message: SHOW_MESSAGE.DTO.COMMON.SEAT_PRICE.MAX })
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.PRICE_A.IS_NOT_EMPTY })
  @Column({ type: 'int', nullable: false })
  priceA: number;

  /**
   * S 좌석 가격
   * @example 5000
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(SHOW_CONSTANT.DTO.MAX_PRICE, { message: SHOW_MESSAGE.DTO.COMMON.SEAT_PRICE.MAX })
  @Column({ type: 'int', nullable: true, default: 0 })
  priceS: number;

  /**
   * R 좌석 가격
   * @example 10000
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(SHOW_CONSTANT.DTO.MAX_PRICE, { message: SHOW_MESSAGE.DTO.COMMON.SEAT_PRICE.MAX })
  @Column({ type: 'int', nullable: true, default: 0 })
  priceR: number;

  /**
   * Vip 좌석 가격
   * @example 30000
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(SHOW_CONSTANT.DTO.MAX_PRICE, { message: SHOW_MESSAGE.DTO.COMMON.SEAT_PRICE.MAX })
  @Column({ type: 'int', nullable: true, default: 0 })
  priceVip: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 공연 엔티티와 관계 설정
  @OneToOne(() => Show, (show) => show.showPrice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  show: Show;
}
