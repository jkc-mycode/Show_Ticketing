import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';
import { Category } from '../types/show-category.type';
import { Transform, Type } from 'class-transformer';
import { SHOW_MESSAGE } from 'src/constants/show/show.message.constant';
import { SHOW_CONSTANT } from 'src/constants/show/show.constant';

export class CreateShowDto {
  // 공연 제목
  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.TITLE.IS_NOT_EMPTY })
  title: string;

  // 공연 내용
  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.CONTENT.IS_NOT_EMPTY })
  content: string;

  // 공연 카테고리
  @IsEnum(Category)
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.CATEGORY.IS_NOT_EMPTY })
  category: Category;

  // 공연 상영 시간
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.RUNNING_TIME.IS_NOT_EMPTY })
  runningTime: number;

  // 공연 시간 배열
  // 가져오는 시간 배열이 문자열 형태의 배열이기 때문에
  // 데이터를 가공할 필요가 있음
  @Transform(({ value }) => {
    const dateTimeArray = value.slice(1, -1).split(',');
    const dates = dateTimeArray.map((str: string) => new Date(str.trim().slice(1, -1)));
    if (Array.isArray(dates)) {
      return dates.map((item) => new Date(item));
    }
    return dates;
  })
  @IsArray()
  @IsDate({ each: true })
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.TIMES.IS_NOT_EMPTY })
  times: Date[];

  // 장소명
  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.PLACE_NAME.IS_NOT_EMPTY })
  placeName: string;

  // A좌석 수
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.SEAT_A.IS_NOT_EMPTY })
  seatA: number;

  // S좌석 수
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  seatS: number;

  // R좌석 수
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  seatR: number;

  // Vip좌석 수
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  seatVip: number;

  // A좌석 가격
  @Type(() => Number)
  @IsNumber()
  @Max(SHOW_CONSTANT.DTO.MAX_PRICE, { message: SHOW_MESSAGE.DTO.COMMON.SEAT_PRICE.MAX })
  @IsNotEmpty({ message: SHOW_MESSAGE.DTO.PRICE_A.IS_NOT_EMPTY })
  priceA: number;

  // S좌석 가격
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(SHOW_CONSTANT.DTO.MAX_PRICE, { message: SHOW_MESSAGE.DTO.COMMON.SEAT_PRICE.MAX })
  priceS: number;

  // R좌석 가격
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(SHOW_CONSTANT.DTO.MAX_PRICE, { message: SHOW_MESSAGE.DTO.COMMON.SEAT_PRICE.MAX })
  priceR: number;

  // Vip좌석 가격
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(SHOW_CONSTANT.DTO.MAX_PRICE, { message: SHOW_MESSAGE.DTO.COMMON.SEAT_PRICE.MAX })
  priceVip: number;
}
