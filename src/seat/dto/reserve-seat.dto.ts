import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReserveSeatDto {
  // 좌석 번호
  @IsNumber()
  @IsNotEmpty({ message: '좌석 번호를 입력해 주세요.' })
  seatNumber: number;

  // 공연 날짜 ID
  @IsNumber()
  @IsNotEmpty({ message: '공연 시간 ID를 입력해 주세요.' })
  showTimeId: number;
}
