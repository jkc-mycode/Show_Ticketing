import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Show } from 'src/show/entities/show.entity';
import { ReserveSeatDto } from './dto/reserve-seat.dto';
import { ShowPlace } from 'src/show/entities/showPlace.entity';
import _ from 'lodash';
import { Ticket } from './entities/ticket.entity';
import { Grade } from './types/grade.type';
import { ShowTime } from 'src/show/entities/showTime.entity';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    @InjectRepository(ShowPlace)
    private readonly showPlaceRepository: Repository<ShowPlace>,
    @InjectRepository(ShowTime)
    private readonly showTimeRepository: Repository<ShowTime>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly dataSource: DataSource,
  ) {}

  // 좌석 예매
  async reserveSeat(user: User, showId: number, reserveSeatDto: ReserveSeatDto) {
    console.log(user);
    console.log(showId);
    console.log(reserveSeatDto);

    const { seatNumber, showTimeId } = reserveSeatDto;

    const seat = await this.seatRepository.findOne({
      where: { seatNumber, showTimeId },
    });
    if (_.isNil(seat)) {
      throw new NotFoundException('등록된 좌석이 없습니다.');
    }
    if (seat.isReserved) {
      throw new UnauthorizedException('이미 예약된 좌석입니다.');
    }
    if (user.point < seat.price) {
      throw new UnauthorizedException('포인트가 부족합니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 사용자 포인트 감소
      const updatedUser = this.userRepository.merge(user, { point: user.point - seat.price });
      // 좌석이 예약됨으로 변경
      const updatedSeat = this.seatRepository.merge(seat, { isReserved: true });
      // 해당 등급 좌석의 잔여 수량 변경
      const place = await this.showPlaceRepository.findOne({
        where: { showTimeId },
      });

      const condition = {};
      if (seat.grade === Grade.A) {
        condition['seatA'] = place.seatA - 1;
      } else if (seat.grade === Grade.S) {
        condition['seatS'] = place.seatS - 1;
      } else if (seat.grade === Grade.R) {
        condition['seatR'] = place.seatR - 1;
      } else {
        condition['seatVip'] = place.seatVip - 1;
      }

      const updatedPlace = this.showPlaceRepository.merge(place, condition);

      // 티켓 생성
      const show = await this.showRepository.findOne({
        where: { id: showId },
      });
      const showTime = await this.showTimeRepository.findOne({
        where: { id: showTimeId },
      });
      const newTicket = this.ticketRepository.create({
        userId: user.id,
        seatId: seat.id,
        title: show.title,
        runningTime: show.runningTime,
        date: showTime.showTime,
        userName: user.nickname,
        seatNumber: seat.seatNumber,
        grade: seat.grade,
        price: seat.price,
        place: place.placeName,
      });

      await Promise.all([
        queryRunner.manager.save(updatedUser),
        queryRunner.manager.save(updatedSeat),
        queryRunner.manager.save(updatedPlace),
        queryRunner.manager.save(newTicket),
      ]);

      await queryRunner.commitTransaction();

      return newTicket;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
