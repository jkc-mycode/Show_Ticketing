import { forwardRef, Module } from '@nestjs/common';
import { SeatService } from './seat.service';
import { SeatController } from './seat.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsModule } from 'src/aws/aws.module';
import { Seat } from './entities/seat.entity';
import { SeatCheckInterceptor } from './utils/seat-check.interceptor';
import { ShowModule } from 'src/show/show.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    // JwtModule이라는 동적 모듈을 설정하고 다른 auth 모듈에서 사용하기 위한 코드
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Seat]),
    AwsModule,
    forwardRef(() => ShowModule),
    TicketModule,
    UserModule,
  ],
  providers: [SeatService, SeatCheckInterceptor],
  controllers: [SeatController],
  exports: [SeatService],
})
export class SeatModule {}
