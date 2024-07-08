import { forwardRef, Module } from '@nestjs/common';
import { SeatService } from './seat.service';
import { SeatController } from './seat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsModule } from 'src/aws/aws.module';
import { Seat } from './entities/seat.entity';
import { SeatCheckInterceptor } from './utils/seat-check.interceptor';
import { ShowModule } from 'src/show/show.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
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
