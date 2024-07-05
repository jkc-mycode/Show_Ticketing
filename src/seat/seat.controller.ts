import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SeatService } from './seat.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';
import { ReserveSeatDto } from './dto/reserve-seat.dto';
import { CancelTicketDto } from './dto/cancel-ticket.dto';

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
