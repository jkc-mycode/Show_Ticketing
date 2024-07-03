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

@Entity({
  name: 'show_price',
})
export class ShowPrice {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Column({ type: 'int', name: 'show_id' })
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
  @JoinColumn({ name: 'show_id' })
  show: Show;
}
