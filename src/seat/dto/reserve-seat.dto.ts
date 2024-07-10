import { IsNotEmpty, IsNumber } from 'class-validator';
import { SEAT_MESSAGE } from 'src/constants/seat/seat.message.constant';

export class ReserveSeatDto {
  // 좌석 번호
  @IsNumber()
  @IsNotEmpty({ message: SEAT_MESSAGE.DTO.RESERVE.SEAT_NUMBER.IS_NOT_EMPTY })
  seatNumber: number;

  // 공연 일정 ID
  @IsNumber()
  @IsNotEmpty({ message: SEAT_MESSAGE.DTO.RESERVE.SHOW_TIME_ID.IS_NOT_EMPTY })
  showScheduleId: number;
}
