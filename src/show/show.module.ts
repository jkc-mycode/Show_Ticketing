import { forwardRef, Module } from '@nestjs/common';
import { ShowService } from './show.service';
import { ShowController } from './show.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from './entities/show.entity';
import { ShowImage } from './entities/showImage.entity';
import { ShowTime } from './entities/showTime.entity';
import { ShowPlace } from './entities/showPlace.entity';
import { ShowPrice } from './entities/showPrice.entity';
import { AwsModule } from 'src/aws/aws.module';
import { SeatModule } from 'src/seat/seat.module';

@Module({
  imports: [
    // JwtModule이라는 동적 모듈을 설정하고 다른 auth 모듈에서 사용하기 위한 코드
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Show, ShowImage, ShowTime, ShowPlace, ShowPrice]),
    AwsModule,
    forwardRef(() => SeatModule),
  ],
  providers: [ShowService],
  controllers: [ShowController],
  exports: [ShowService],
})
export class ShowModule {}
