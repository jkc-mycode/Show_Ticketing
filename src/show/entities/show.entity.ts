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
import { ShowTime } from './show-time.entity';
import { ShowPrice } from './show-price.entity';
import { ShowPlace } from './show-place.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { SHOW_CONSTANT } from 'src/constants/show/show.constant';

@Entity({
  name: SHOW_CONSTANT.ENTITY.SHOW.NAME,
})
export class Show {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Index()
  @Column({ type: 'enum', enum: Category, nullable: false })
  category: Category;

  @Column({ type: 'int', nullable: false })
  runningTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ShowImage, (showImage) => showImage.show)
  showImages: ShowImage[];

  @OneToMany(() => ShowTime, (showTime) => showTime.show)
  showTimes: ShowTime[];

  @OneToOne(() => ShowPrice, (showPrice) => showPrice.show)
  showPrice: ShowPrice;

  @OneToMany(() => ShowPlace, (showPlace) => showPlace.show)
  showPlace: ShowPlace[];

  @OneToMany(() => Seat, (seat) => seat.show)
  seats: Seat;
}
