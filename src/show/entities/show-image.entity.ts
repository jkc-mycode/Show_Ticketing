import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Show } from './show.entity';
import { SHOW_CONSTANT } from 'src/constants/show/show.constant';

@Entity({
  name: SHOW_CONSTANT.ENTITY.SHOW_IMAGE.NAME,
})
export class ShowImage {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Column({ type: 'int', name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  showId: number;

  @Column({ type: 'varchar', nullable: false })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  // 공연 엔티티와 관계 설정
  @ManyToOne(() => Show, (show) => show.showImages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  show: Show;
}
