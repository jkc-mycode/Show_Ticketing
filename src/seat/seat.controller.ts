import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { SeatService } from './seat.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';
import { ReserveSeatDto } from './dto/reserve-seat.dto';
import { CancelTicketDto } from './dto/cancel-ticket.dto';
import { SeatCheckInterceptor } from './utils/seat-check.interceptor';

@Controller('seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  // 공연 예매 취소
  @UseGuards(AuthGuard('jwt'))
  @Post('/cancel')
  async cancelTicket(@UserInfo() user: User, @Body() cancelTicketDto: CancelTicketDto) {
    return await this.seatService.cancelTicket(user, cancelTicketDto);
  }

  // 공연 좌석 예매
  @UseGuards(AuthGuard('jwt'))
  // 사용자가 입력한 좌석이 예매된 좌석인지 체크 (컨트롤러 실행 전에 인터셉터)
  @UseInterceptors(SeatCheckInterceptor)
  @Post('/:showId')
  async reserveSeat(
    @UserInfo() user: User,
    @Param('showId') showId: string,
    @Body() reserveSeatDto: ReserveSeatDto,
  ) {
    return await this.seatService.reserveSeat(user, +showId, reserveSeatDto);
  }

  // 공연 좌석 예매 정보 확인
  @Get('/:showId')
  async findSeatInfoByShowId(@Param('showId') showId: string) {
    return await this.seatService.findSeatInfoByShowId(+showId);
  }
}
