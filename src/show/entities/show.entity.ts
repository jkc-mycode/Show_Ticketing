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
import { Category } from '../types/showCategory.type';
import { ShowImage } from './showImage.entity';
import { ShowTime } from './showTime.entity';
import { ShowPrice } from './showPrice.entity';
import { ShowPlace } from './showPlace.entity';
import { Seat } from 'src/seat/entities/seat.entity';

@Entity({
  name: 'show',
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
