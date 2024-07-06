import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { SeatService } from '../seat.service';

@Injectable()
export class SeatCheckInterceptor implements NestInterceptor {
  constructor(private readonly seatService: SeatService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { seatNumber, showTimeId } = request.body;

    // 예매 여부 체크
    const seat = await this.seatService.findSeatInfo(seatNumber, showTimeId);
    if (seat.isReserved) {
      throw new BadRequestException('해당 좌석은 이미 예매되었습니다.');
    }

    return next.handle().pipe(
      tap(() => {
        // 좌석 예매 로직이 끝나고 동작하는 구간
      }),
    );
  }
}
