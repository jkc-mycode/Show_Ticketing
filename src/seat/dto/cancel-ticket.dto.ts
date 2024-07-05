import { IsNotEmpty, IsNumber } from 'class-validator';

export class CancelTicketDto {
  // 티켓 ID
  @IsNumber()
  @IsNotEmpty({ message: '티켓 ID를 입력해 주세요.' })
  ticketId: number;
}
