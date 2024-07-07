import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Show } from './entities/show.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateShowDto } from './dto/create-show.dto';
import { ShowImage } from './entities/show-image.entity';
import { ShowTime } from './entities/show-time.entity';
import { ShowPrice } from './entities/show-price.entity';
import { ShowPlace } from './entities/show-place.entity';
import { AwsService } from 'src/aws/aws.service';
import { Category } from './types/show-category.type';
import { Grade } from 'src/seat/types/grade.type';
import { SeatService } from 'src/seat/seat.service';
import { SHOW_MESSAGE } from 'src/constants/show/show.message.constant';

@Injectable()
export class ShowService {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    @InjectRepository(ShowImage)
    private readonly showImageRepository: Repository<ShowImage>,
    @InjectRepository(ShowTime)
    private readonly showTimeRepository: Repository<ShowTime>,
    @InjectRepository(ShowPrice)
    private readonly showPriceRepository: Repository<ShowPrice>,
    @InjectRepository(ShowPlace)
    private readonly showPlaceRepository: Repository<ShowPlace>,
    @Inject(forwardRef(() => SeatService))
    private readonly seatService: SeatService,
    private readonly dataSource: DataSource,
    private readonly awsService: AwsService,
  ) {}

  // 공연 등록
  async createShow(createShowDto: CreateShowDto, files: Express.Multer.File[]) {
    const {
      title,
      content,
      category,
      runningTime,
      times,
      placeName,
      seatA,
      seatS,
      seatR,
      seatVip,
      priceA,
      priceS,
      priceR,
      priceVip,
    } = createShowDto;

    // 트랜젝션 연결 설정 초기화
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 이미지 업로드 후 반환되는 이미지 URL 배열
    let images: string[];

    try {
      // show 테이블에 데이터 저장
      const show = this.showRepository.create({
        title,
        content,
        category,
        runningTime,
      });
      // 다른 테이블에서 show.id를 사용하기 때문에 따로 저장
      await queryRunner.manager.save(show);

      // 이미지 데이터를 업로드
      images = await this.awsService.uploadImage(files);

      // show_price 테이블에 데이터 저장
      const showPrice = this.showPriceRepository.create({
        showId: show.id,
        priceA,
        priceS,
        priceR,
        priceVip,
      });

      // show_time 테이블에 데이터 저장
      const showTimes = times.map((time) =>
        this.showTimeRepository.create({
          showId: show.id,
          showTime: time,
        }),
      );

      // show_image 테이블에 데이터 저장
      const showImages = images.map((image) =>
        this.showImageRepository.create({
          showId: show.id,
          imageUrl: image,
        }),
      );

      // queryRunner를 병렬로 처리해서 데이터베이스에 저장
      await Promise.all([
        queryRunner.manager.save(showPrice),
        queryRunner.manager.save(showTimes),
        queryRunner.manager.save(showImages),
      ]);

      // show_place 테이블에 데이터 저장
      const totalSeat: number = seatA + (seatS ?? 0) + (seatR ?? 0) + (seatVip ?? 0);
      const showPlace = showTimes.map((showTime) =>
        this.showPlaceRepository.create({
          showId: show.id,
          showTimeId: showTime.id,
          placeName,
          totalSeat,
          seatA,
          seatS,
          seatR,
          seatVip,
        }),
      );
      await queryRunner.manager.save(showPlace);

      // 장소(시간)별, 등급별 좌석 정보 추가하기
      for (let k = 0; k < showPlace.length; k++) {
        let seatNumber = 1;
        // A 좌석 데이터 저장
        for (let i = 1; i <= showPlace[k].seatA; i++) {
          await queryRunner.manager.save(
            this.seatService.createSeat(
              show.id,
              showPlace[k].showTimeId,
              seatNumber,
              Grade.A,
              showPrice.priceA,
            ),
          );
          seatNumber++;
        }

        // S 좌석 데이터 저장
        for (let i = 1; i <= showPlace[k].seatS; i++) {
          await queryRunner.manager.save(
            this.seatService.createSeat(
              show.id,
              showPlace[k].showTimeId,
              seatNumber,
              Grade.S,
              showPrice.priceS,
            ),
          );
          seatNumber++;
        }

        // R 좌석 데이터 저장
        for (let i = 1; i <= showPlace[k].seatR; i++) {
          await queryRunner.manager.save(
            this.seatService.createSeat(
              show.id,
              showPlace[k].showTimeId,
              seatNumber,
              Grade.R,
              showPrice.priceR,
            ),
          );
          seatNumber++;
        }

        // Vip 좌석 데이터 저장
        for (let i = 1; i <= showPlace[k].seatVip; i++) {
          await queryRunner.manager.save(
            this.seatService.createSeat(
              show.id,
              showPlace[k].showTimeId,
              seatNumber,
              Grade.VIP,
              showPrice.priceVip,
            ),
          );
          seatNumber++;
        }
      }

      // 출력 형식 지정
      const createdShow = {
        id: show.id,
        title,
        content,
        runningTime,
        placeName,
        totalSeat,
        priceA,
        priceS,
        priceR,
        priceVip,
        showTimes: showTimes.map((time) => time.showTime),
        showImages: showImages.map((image) => image.imageUrl),
        createdAt: show.createdAt,
        updatedAt: show.updatedAt,
      };

      await queryRunner.commitTransaction();
      return createdShow;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      // 트랜젝션 실패 시 S3 이미지도 롤백
      await this.awsService.rollbackS3Image(images);
      throw new InternalServerErrorException(SHOW_MESSAGE.CREATE_SHOW.FAIL);
    } finally {
      await queryRunner.release();
    }
  }

  // 공연 목록 조회
  async findShowList(queryData: string) {
    const showList = await this.showRepository.find({
      // 쿼리 스트링을 통해 카테고리별로 조회
      where: queryData ? { category: Category[queryData.toUpperCase()] } : {},
      relations: {
        showImages: true,
        showPlace: true,
        showTimes: true,
      },
      order: { createdAt: 'DESC' },
    });

    // 출력 형식 지정
    const createdShowList = showList.map((show) => {
      return {
        id: show.id,
        title: show.title,
        category: show.category,
        placeName: show.showPlace[0].placeName,
        showTimes: show.showTimes.map((time) => time.showTime),
        showPoster: show.showImages[0].imageUrl,
        createdAt: show.createdAt,
        updatedAt: show.updatedAt,
      };
    });

    return createdShowList;
  }

  // 공연 검색
  async findShowByTitle(title: string) {
    // 쿼리빌더를 활용한 데이터베이스 접근
    // 기존에 find, findOne 방식이 아닌 다른 방법으로 접근함
    const shows = await this.showRepository
      .createQueryBuilder('show')
      .innerJoinAndSelect('show.showPlace', 'showPlace')
      .innerJoinAndSelect('show.showImages', 'showImage')
      .innerJoinAndSelect('show.showTimes', 'showTime')
      // 해당 제목의 일부만 있어도 검색 가능
      .where('show.title like :title', { title: `%${title}%` })
      .orderBy('show.createdAt', 'DESC')
      .getMany();

    // 출력 형식 지정
    const searchedShow = shows.map((show) => {
      return {
        id: show.id,
        title: show.title,
        category: show.category,
        placeName: show.showPlace[0].placeName,
        showTimes: show.showTimes.map((time) => time.showTime),
        showPoster: show.showImages[0].imageUrl,
        createdAt: show.createdAt,
        updatedAt: show.updatedAt,
      };
    });
    return searchedShow;
  }

  // 공연 상세 조회
  async findShowDetail(showId: number) {
    const show = await this.showRepository.findOne({
      where: { id: showId },
      relations: {
        showImages: true,
        showPlace: true,
        showTimes: true,
        showPrice: true,
      },
    });
    if (!show) {
      throw new NotFoundException(SHOW_MESSAGE.FIND_SHOW_DETAIL.SHOW.NOT_FOUND);
    }

    // 출력 형식 지정
    const searchedShow = {
      id: show.id,
      title: show.title,
      content: show.content,
      category: show.category,
      runningTime: show.runningTime,
      placeName: show.showPlace[0].placeName,
      totalSeat: show.showPlace[0].totalSeat,
      priceA: show.showPrice.priceA,
      priceS: show.showPrice.priceS,
      priceR: show.showPrice.priceR,
      priceVip: show.showPrice.priceVip,
      // 날짜별 잔여 좌석 수
      showPlace: show.showPlace.map((place) => {
        return {
          seatA: place.seatA,
          seatS: place.seatS,
          seatR: place.seatR,
          seatVip: place.seatVip,
        };
      }),
      showTimes: show.showTimes.map((time) => time.showTime),
      showPoster: show.showImages.map((image) => image.imageUrl),
      createdAt: show.createdAt,
      updatedAt: show.updatedAt,
    };

    return searchedShow;
  }

  // 공연 ID를 통해 공연 정보 반환
  async findShowByShowId(showId: number) {
    return await this.showRepository.findOne({
      where: { id: showId },
    });
  }

  // 공연 시간 ID를 통해 공연 장소 정보 반환(좌석 수)
  async findShowPlaceByShowTimeId(showTimeId: number) {
    return await this.showPlaceRepository.findOne({
      where: { showTimeId },
    });
  }

  // 공연 시간 ID를 통해 공연 시간 정보 반환
  async findShowTimeByShowTimeId(showTimeId: number) {
    return await this.showTimeRepository.findOne({
      where: { id: showTimeId },
    });
  }

  // 공연 장소의 좌석 수 수정
  updatedShowPlaceSeatCount(place: ShowPlace, condition: object) {
    return this.showPlaceRepository.merge(place, condition);
  }
}
