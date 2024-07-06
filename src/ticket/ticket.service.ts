import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Show } from 'src/show/entities/show.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { ShowTime } from 'src/show/entities/showTime.entity';
import { ShowPlace } from 'src/show/entities/showPlace.entity';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketService {
  constructor(@InjectRepository(Ticket) private readonly ticketRepository: Repository<Ticket>) {}

  // 사용자 ID를 통해 티켓 정보 반환
  async findTicketsByUserId(userId: number) {
    return await this.ticketRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // 티켓 ID를 통해 티켓 정보 반환
  async findTicketByTicketId(id: number) {
    return await this.ticketRepository.findOne({
      where: { id },
    });
  }

  // 티켓 생성
  createTicket(user: User, show: Show, seat: Seat, time: ShowTime, place: ShowPlace) {
    return this.ticketRepository.create({
      userId: user.id,
      seatId: seat.id,
      title: show.title,
      runningTime: show.runningTime,
      date: time.showTime,
      userName: user.nickname,
      seatNumber: seat.seatNumber,
      grade: seat.grade,
      price: seat.price,
      place: place.placeName,
    });
  }

  // 티켓 취소
  cancelTicket(ticket: Ticket) {
    // 공연 예매 취소 (티켓 isCanceled: True)
    return this.ticketRepository.merge(ticket, { isCanceled: true });
  }
}
