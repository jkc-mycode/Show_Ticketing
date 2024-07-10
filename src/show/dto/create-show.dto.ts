import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { Show } from '../entities/show.entity';
import { CreatePriceDto } from './create-price.dto';
import { UploadImageDto } from './upload-image.dto';
import { CreateSchedule } from './create-schedule.dto';
import { CreatePlaceDto } from './create-place.dto';

export class CreateShowDto extends PickType(Show, ['title', 'content', 'category', 'runningTime']) {
  // 공연 시간 배열
  // 가져오는 시간 배열이 문자열 형태의 배열이기 때문에
  // 데이터를 가공할 필요가 있음
  // @Transform(({ value }) => {
  //   // const dateTimeArray = value.slice(1, -1).split(',');
  //   // const dates = dateTimeArray.map((str: string) => new Date(str.trim().slice(1, -1)));
  //   // const dates = JSON.parse(value);
  //   if (Array.isArray(value)) {
  //     return value.map((item) => new Date(item));
  //   }
  // })
  // @IsArray()
  // @IsDate({ each: true })

  @ValidateNested()
  @Type(() => CreateSchedule)
  showSchedules: CreateSchedule[];

  @ValidateNested()
  @Type(() => UploadImageDto)
  showImages: UploadImageDto[];

  @ValidateNested()
  @Type(() => CreatePlaceDto)
  showPlace: CreatePlaceDto;

  @ValidateNested()
  @Type(() => CreatePriceDto)
  showPrice: CreatePriceDto;
}
