import { PickType } from '@nestjs/swagger';
import { ShowSchedule } from '../entities/show-schedule.entity';

export class CreatePlaceDto extends PickType(ShowSchedule, [
  'placeName',
  'seatA',
  'seatS',
  'seatR',
  'seatVip',
]) {}
