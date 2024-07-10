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
import { IsNotEmpty, IsString } from 'class-validator';
import { SHOW_MESSAGE } from 'src/constants/show/show.message.constant';

@Entity({
  name: SHOW_CONSTANT.ENTITY.SHOW_IMAGE.NAME,
})
export class ShowImage {
  @PrimaryGeneratedColumn()
  id: number;

  // 공연 외래키 설정
  @Column({ type: 'int', name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  showId: number;

  /**
   * 이미지 URL
   * @example ["2024-07-05T04:00:00.000Z", "2024-07-11T04:00:00.000Z", "2024-07-12T04:00:00.000Z"]
   */
  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.IMAGES.IS_NOT_EMPTY })
  @Column({ type: 'varchar', nullable: false })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  // 공연 엔티티와 관계 설정
  @ManyToOne(() => Show, (show) => show.showImages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: SHOW_CONSTANT.ENTITY.COMMON.SHOW_ID })
  show: Show;
}
