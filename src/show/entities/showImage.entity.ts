import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Show } from './show.entity';

@Entity({
  name: 'show_image',
})
export class ShowImage {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Column({ type: 'int', name: 'show_id' })
  showId: number;

  @Column({ type: 'varchar', nullable: false })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  // 공연 엔티티와 관계 설정
  @ManyToOne(() => Show, (show) => show.showImages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;
}
