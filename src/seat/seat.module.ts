import { Module } from '@nestjs/common';
import { SeatService } from './seat.service';
import { SeatController } from './seat.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsModule } from 'src/aws/aws.module';
import { Show } from 'src/show/entities/show.entity';
import { Seat } from './entities/seat.entity';
import { User } from 'src/user/entities/user.entity';
import { ShowPlace } from 'src/show/entities/showPlace.entity';
import { Ticket } from './entities/ticket.entity';
import { ShowTime } from 'src/show/entities/showTime.entity';
import { SeatCheckInterceptor } from './utils/seat-check.interceptor';

@Module({
  imports: [
    // JwtModule이라는 동적 모듈을 설정하고 다른 auth 모듈에서 사용하기 위한 코드
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Show, Seat, User, ShowPlace, Ticket, ShowTime]),
    AwsModule,
  ],
  providers: [SeatService, SeatCheckInterceptor],
  controllers: [SeatController],
  exports: [SeatService],
})
export class SeatModule {}
