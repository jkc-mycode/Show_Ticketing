import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { SeatService } from './seat.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';
import { ReserveSeatDto } from './dto/reserve-seat.dto';

@Controller('seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/:showId')
  async reserveSeat(
    @UserInfo() user: User,
    @Param('showId') showId: string,
    @Body() reserveSeatDto: ReserveSeatDto,
  ) {
    return await this.seatService.reserveSeat(user, +showId, reserveSeatDto);
  }
}
