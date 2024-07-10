import { forwardRef, Module } from '@nestjs/common';
import { ShowService } from './show.service';
import { ShowController } from './show.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from './entities/show.entity';
import { ShowImage } from './entities/show-image.entity';
import { ShowPrice } from './entities/show-price.entity';
import { AwsModule } from 'src/aws/aws.module';
import { SeatModule } from 'src/seat/seat.module';
import { ShowSchedule } from './entities/show-schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Show, ShowImage, ShowPrice, ShowSchedule]),
    AwsModule,
    forwardRef(() => SeatModule),
  ],
  providers: [ShowService],
  controllers: [ShowController],
  exports: [ShowService],
})
export class ShowModule {}
