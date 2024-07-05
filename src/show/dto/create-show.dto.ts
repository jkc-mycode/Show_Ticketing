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
import { Category } from '../types/showCategory.type';
import { Transform, Type } from 'class-transformer';

export class CreateShowDto {
  // 공연 제목
  @IsString()
  @IsNotEmpty({ message: '공연 제목을 입력해 주세요.' })
  title: string;

  // 공연 내용
  @IsString()
  @IsNotEmpty({ message: '공연 내용을 입력해 주세요.' })
  content: string;

  // 공연 카테고리
  @IsEnum(Category)
  @IsNotEmpty({ message: '공연 카테고리를 입력해 주세요.' })
  category: Category;

  // 공연 상영 시간
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: '공연 상영 시간을 입력해 주세요.' })
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
  @IsNotEmpty({ message: '공연 시간을 입력해 주세요.' })
  times: Date[];

  // 장소명
  @IsString()
  @IsNotEmpty({ message: '장소명을 입력해 주세요.' })
  placeName: string;

  // A좌석 수
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: '장소의 A좌석 수를 입력해 주세요.' })
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
  @Max(50000, { message: '좌석의 가격은 5만 포인트 이하여야 합니다.' })
  @IsNotEmpty({ message: '장소의 A좌석 가격을 입력해 주세요.' })
  priceA: number;

  // S좌석 가격
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(50000, { message: '좌석의 가격은 5만 포인트 이하여야 합니다.' })
  priceS: number;

  // R좌석 가격
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(50000, { message: '좌석의 가격은 5만 포인트 이하여야 합니다.' })
  priceR: number;

  // Vip좌석 가격
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(50000, { message: '좌석의 가격은 5만 포인트 이하여야 합니다.' })
  priceVip: number;
}
