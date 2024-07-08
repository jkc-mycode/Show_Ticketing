import { IsNotEmpty, IsNumber } from 'class-validator';
import { TICKET_MESSAGE } from 'src/constants/ticket/ticket.message.constant';

export class CancelTicketDto {
  // 티켓 ID
  @IsNumber()
  @IsNotEmpty({ message: TICKET_MESSAGE.DTO.CANCEL.TICKET_ID.IS_NOT_EMPTY })
  ticketId: number;
}
