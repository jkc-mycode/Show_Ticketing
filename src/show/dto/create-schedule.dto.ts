import { PickType } from '@nestjs/swagger';
import { ShowSchedule } from '../entities/show-schedule.entity';

export class CreateSchedule extends PickType(ShowSchedule, ['showTime']) {}
