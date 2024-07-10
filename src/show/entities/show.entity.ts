import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../types/show-category.type';
import { ShowImage } from './show-image.entity';
import { ShowPrice } from './show-price.entity';
import { SHOW_CONSTANT } from 'src/constants/show/show.constant';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SHOW_MESSAGE } from 'src/constants/show/show.message.constant';
import { Type } from 'class-transformer';
import { ShowSchedule } from './show-schedule.entity';

@Entity({
  name: SHOW_CONSTANT.ENTITY.SHOW.NAME,
})
export class Show {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 공연 제목
   * @example "공연 제목 테스트"
   */
  @Index()
  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.TITLE.IS_NOT_EMPTY })
  @Column({ type: 'varchar', nullable: false })
  title: string;

  /**
   * 공연 내용
   * @example "공연 내용 테스트"
   */
  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.CONTENT.IS_NOT_EMPTY })
  @Column({ type: 'text', nullable: false })
  content: string;

  /**
   * 공연 카테고리
   * @example "CONCERT"
   */
  @Index()
  @IsEnum(Category)
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.CATEGORY.IS_NOT_EMPTY })
  @Column({ type: 'enum', enum: Category, nullable: false })
  category: Category;

  /**
   * 공연 상영 시간
   * @example 2
   */
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.RUNNING_TIME.IS_NOT_EMPTY })
  @Column({ type: 'int', nullable: false })
  runningTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ShowImage, (showImage) => showImage.show, { cascade: true })
  showImages: ShowImage[];

  @OneToMany(() => ShowSchedule, (showSchedule) => showSchedule.show, { cascade: true })
  showSchedules: ShowSchedule[];

  @OneToOne(() => ShowPrice, (showPrice) => showPrice.show, { cascade: true })
  showPrice: ShowPrice;
}
