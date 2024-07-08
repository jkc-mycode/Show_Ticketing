import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { ReserveSeatDto } from './dto/reserve-seat.dto';
import _ from 'lodash';
import { Grade } from './types/grade.type';
import { TicketService } from 'src/ticket/ticket.service';
import { UserService } from 'src/user/user.service';
import { ShowService } from 'src/show/show.service';
import { CancelTicketDto } from 'src/ticket/dto/cancel-ticket.dto';
import { SEAT_MESSAGE } from 'src/constants/seat/seat.message.constant';
import { SEAT_CONSTANT } from 'src/constants/seat/seat.constant';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ShowService))
    private readonly showService: ShowService,
    private readonly ticketService: TicketService,
    private readonly dataSource: DataSource,
  ) {}

  // 좌석 예매
  async reserveSeat(user: User, showId: number, reserveSeatDto: ReserveSeatDto) {
    const { seatNumber, showTimeId } = reserveSeatDto;

    // 존재하는 공연인지 체크
    const show = await this.showService.findShowByShowId(showId);
    if (_.isNil(show)) {
      throw new NotFoundException(SEAT_MESSAGE.RESERVE_SEAT.SHOW.NOT_FOUND);
    }

    // 존재하는 공연 시간인지 체크
    const showTime = await this.showService.findShowTimeByShowTimeId(showTimeId);
    if (_.isNil(showTime)) {
      throw new NotFoundException(SEAT_MESSAGE.RESERVE_SEAT.SHOW_TIME.NOT_FOUND);
    }

    // 존재하는 좌석인지 체크
    const seat = await this.findSeatInfo(seatNumber, showTimeId);
    if (_.isNil(seat)) {
      throw new NotFoundException(SEAT_MESSAGE.RESERVE_SEAT.SEAT.NOT_FOUND);
    }
    if (seat.showTime.showTime < new Date()) {
      throw new BadRequestException(SEAT_MESSAGE.RESERVE_SEAT.SEAT.SHOW_TIME_OVER);
    }

    // 사용자 잔여 포인트 확인
    if (user.point < seat.price) {
      throw new BadRequestException(SEAT_MESSAGE.RESERVE_SEAT.USER.NO_POINT);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 사용자 포인트 감소
      const updatedUser = this.userService.updateUserPoint(user, user.point - seat.price);
      // 좌석이 예약됨으로 변경
      const updatedSeat = this.seatRepository.merge(seat, { isReserved: true });
      // 해당 등급 좌석의 잔여 수량 변경
      const place = await this.showService.findShowPlaceByShowTimeId(showTimeId);

      // 어떤 좌석의 수를 변경할지에 대한 객체 생성
      const condition = {};
      if (seat.grade === Grade.A) {
        condition[SEAT_CONSTANT.COMMON.SEAT_GRADE.SEAT_A] = place.seatA - 1;
      } else if (seat.grade === Grade.S) {
        condition[SEAT_CONSTANT.COMMON.SEAT_GRADE.SEAT_S] = place.seatS - 1;
      } else if (seat.grade === Grade.R) {
        condition[SEAT_CONSTANT.COMMON.SEAT_GRADE.SEAT_R] = place.seatR - 1;
      } else {
        condition[SEAT_CONSTANT.COMMON.SEAT_GRADE.SEAT_VIP] = place.seatVip - 1;
      }

      // 잔여 좌석 수 변경
      const updatedPlace = this.showService.updatedShowPlaceSeatCount(place, condition);

      // 티켓 생성
      const newTicket = this.ticketService.createTicket(user, show, seat, showTime, place);

      await Promise.all([
        queryRunner.manager.save(updatedUser),
        queryRunner.manager.save(updatedSeat),
        queryRunner.manager.save(updatedPlace),
        queryRunner.manager.save(newTicket),
      ]);

      // 트랜젝션 내용 적용
      await queryRunner.commitTransaction();

      return newTicket;
    } catch (err) {
      // 트랜젝션 실패 시 롤백
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(SEAT_MESSAGE.RESERVE_SEAT.FAIL);
    } finally {
      await queryRunner.release();
    }
  }

  // 공연 좌석 예매 정보 조회
  async findSeatInfoByShowId(showId: number) {
    const seats = await this.seatRepository.find({
      where: { showId },
      relations: {
        showTime: true,
      },
    });
    const now = new Date();
    const filteredSeats = seats.filter((seat) => seat.showTime.showTime > now);

    // 클라이언트에게 전달할 양식 지정
    const seatInfo = filteredSeats.map((seat) => {
      return {
        id: seat.id,
        seatNumber: seat.seatNumber,
        grade: seat.grade,
        price: seat.price,
        showTimeId: seat.showTimeId,
        showTime: seat.showTime.showTime,
        isReserved: seat.isReserved,
      };
    });
    return seatInfo;
  }

  // 공연 예매 취소
  async cancelSeat(user: User, cancelTicketDto: CancelTicketDto) {
    const { ticketId } = cancelTicketDto;

    // 해당 티켓이 존재하는지 확인
    const ticket = await this.ticketService.findTicketByTicketId(ticketId);
    if (_.isNil(ticket)) {
      throw new BadRequestException(SEAT_MESSAGE.CANCEL_SEAT.TICKET.NOT_FOUND);
    }

    // 이미 취소된 티켓일 때
    if (ticket.isCanceled === true) {
      throw new BadRequestException(SEAT_MESSAGE.CANCEL_SEAT.TICKET.CANCELED);
    }

    // 공연 시작 3시간 전에 취소하는지 확인
    const now = new Date();
    now.setHours(now.getHours() + 3);
    if (now > ticket.date) {
      throw new BadRequestException(SEAT_MESSAGE.CANCEL_SEAT.TICKET.TIME_LIMIT);
    }

    // 티켓의 소유자와 로그인한 사용자가 같은지 확인
    if (ticket.userId !== user.id) {
      throw new UnauthorizedException(SEAT_MESSAGE.CANCEL_SEAT.TICKET.NOT_MINE);
    }

    // 해당 좌석 조회
    const seat = await this.seatRepository.findOne({
      where: { id: ticket.seatId },
    });

    // 해당 공연의 좌석 수 조회
    const place = await this.showService.findShowPlaceByShowTimeId(seat.showTimeId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 사용자 포인트 환불
      const updatedUser = this.userService.updateUserPoint(user, user.point + ticket.price);

      // 해당 좌석 예매 상태 변경
      const updatedSeat = this.seatRepository.merge(seat, { isReserved: false });

      // 어떤 좌석의 수를 변경할지에 대한 객체 생성
      const condition = {};
      if (seat.grade === Grade.A) {
        condition[SEAT_CONSTANT.COMMON.SEAT_GRADE.SEAT_A] = place.seatA + 1;
      } else if (seat.grade === Grade.S) {
        condition[SEAT_CONSTANT.COMMON.SEAT_GRADE.SEAT_S] = place.seatS + 1;
      } else if (seat.grade === Grade.R) {
        condition[SEAT_CONSTANT.COMMON.SEAT_GRADE.SEAT_R] = place.seatR + 1;
      } else {
        condition[SEAT_CONSTANT.COMMON.SEAT_GRADE.SEAT_VIP] = place.seatVip + 1;
      }

      // 잔여 좌석 수 변경
      const updatedPlace = this.showService.updatedShowPlaceSeatCount(place, condition);

      // 공연 예매 취소 (티켓 isCanceled: True)
      const canceledTicket = this.ticketService.cancelTicket(ticket);

      await Promise.all([
        queryRunner.manager.save(updatedUser),
        queryRunner.manager.save(updatedSeat),
        queryRunner.manager.save(updatedPlace),
        queryRunner.manager.save(canceledTicket),
      ]);

      await queryRunner.commitTransaction();

      return { message: SEAT_MESSAGE.CANCEL_SEAT.SUCCEED };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(SEAT_MESSAGE.CANCEL_SEAT.FAIL);
    } finally {
      await queryRunner.release();
    }
  }

  // 해당 좌석 정보를 반환하는 함수
  async findSeatInfo(seatNumber: number, showTimeId: number) {
    return await this.seatRepository.findOne({
      where: { seatNumber, showTimeId },
      relations: { showTime: true },
    });
  }

  createSeat(showId: number, showTimeId: number, seatNumber: number, grade: Grade, price: number) {
    return this.seatRepository.create({
      showId,
      showTimeId,
      seatNumber,
      grade,
      price,
    });
  }
}
