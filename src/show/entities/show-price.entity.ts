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

@Entity({
  name: SHOW_CONSTANT.ENTITY.SHOW_PRICE.NAME,
})
export class ShowPrice {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Column({ type: 'int', name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  showId: number;

  @Column({ type: 'int', nullable: false })
  priceA: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  priceS: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  priceR: number;

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
