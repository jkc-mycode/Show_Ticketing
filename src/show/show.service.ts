import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  // InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Show } from './entities/show.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateShowDto } from './dto/create-show.dto';
import { AwsService } from 'src/aws/aws.service';
import { Category } from './types/show-category.type';
import { SeatService } from 'src/seat/seat.service';
import { SHOW_MESSAGE } from 'src/constants/show/show.message.constant';
import { Grade } from 'src/seat/types/grade.type';
import { ShowSchedule } from './entities/show-schedule.entity';

@Injectable()
export class ShowService {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    @InjectRepository(ShowSchedule)
    private readonly showScheduleRepository: Repository<ShowSchedule>,
    @Inject(forwardRef(() => SeatService))
    private readonly seatService: SeatService,
    private readonly dataSource: DataSource,
    private readonly awsService: AwsService,
  ) {}

  // 이미지 업로드
  async imageUpload(files: Express.Multer.File[]) {
    // 이미지 데이터를 업로드
    return await this.awsService.uploadImage(files);
  }

  // 공연 등록
  async createShow(createShowDto: CreateShowDto) {
    const { showImages, showSchedules, showPrice, showPlace, ...restOfShow } = createShowDto;

    // 트랜젝션 연결 설정 초기화
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 총 좌석 수
    const totalSeat: number =
      showPlace.seatA + (showPlace.seatS ?? 0) + (showPlace.seatR ?? 0) + (showPlace.seatVip ?? 0);

    try {
      const show = this.showRepository.create({
        ...restOfShow,
        showImages,
        showPrice,
        showSchedules: showSchedules.map((showSchedule) => {
          return {
            ...showSchedule,
            ...showPlace,
            totalSeat,
          };
        }),
      });
      await queryRunner.manager.save(show);

      for (let i = 0; i < showSchedules.length; i++) {
        let seatNumber = 1;
        // A 좌석 데이터 저장
        for (let j = 1; j <= showPlace.seatA; j++) {
          await queryRunner.manager.save(
            this.seatService.createSeat(
              show.id,
              show.showSchedules[i].id,
              seatNumber,
              Grade.A,
              showPrice.priceA,
            ),
          );
          seatNumber++;
        }

        // S 좌석 데이터 저장
        for (let j = 1; j <= showPlace.seatS; j++) {
          await queryRunner.manager.save(
            this.seatService.createSeat(
              show.id,
              show.showSchedules[i].id,
              seatNumber,
              Grade.S,
              showPrice.priceS,
            ),
          );
          seatNumber++;
        }

        // R 좌석 데이터 저장
        for (let j = 1; j <= showPlace.seatR; j++) {
          await queryRunner.manager.save(
            this.seatService.createSeat(
              show.id,
              show.showSchedules[i].id,
              seatNumber,
              Grade.R,
              showPrice.priceR,
            ),
          );
          seatNumber++;
        }

        // Vip 좌석 데이터 저장
        for (let j = 1; j <= showPlace.seatVip; j++) {
          await queryRunner.manager.save(
            this.seatService.createSeat(
              show.id,
              show.showSchedules[i].id,
              seatNumber,
              Grade.VIP,
              showPrice.priceVip,
            ),
          );
          seatNumber++;
        }
      }

      await queryRunner.commitTransaction();

      return {
        ...restOfShow,
        showImages: show.showImages.map((image) => image.imageUrl),
        showSchedules: show.showSchedules.map((schedule) => {
          return {
            showTime: schedule.showTime,
            seatA: schedule.seatA,
            seatS: schedule.seatS,
            seatR: schedule.seatR,
            seatVip: schedule.seatVip,
          };
        }),
        showPrice: {
          priceA: show.showPrice.priceA,
          priceS: show.showPrice.priceR,
          priceR: show.showPrice.priceR,
          priceVip: show.showPrice.priceVip,
        },
      };
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      // 트랜젝션 실패 시 S3 이미지도 롤백
      await this.awsService.rollbackS3Image(showImages.map((image) => image.imageUrl));
      throw new InternalServerErrorException(SHOW_MESSAGE.CREATE_SHOW.FAIL);
    } finally {
      await queryRunner.release();
    }

    // const { title, content, category, runningTime, times } = createShowDto;
    // const { placeName, seatA, seatS, seatR, seatVip } = createShowDto.placeInfo;
    // const { priceA, priceS, priceR, priceVip } = createShowDto.priceInfo;

    // // 트랜젝션 연결 설정 초기화
    // const queryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();

    // try {
    //   // show 테이블에 데이터 저장
    //   const show = this.showRepository.create({
    //     title,
    //     content,
    //     category,
    //     runningTime,
    //   });
    //   // 다른 테이블에서 show.id를 사용하기 때문에 따로 저장
    //   await queryRunner.manager.save(show);

    //   // show_price 테이블에 데이터 저장
    //   const showPrice = this.showPriceRepository.create({
    //     showId: show.id,
    //     priceA,
    //     priceS,
    //     priceR,
    //     priceVip,
    //   });

    //   // show_time 테이블에 데이터 저장
    //   const showTimes = times.map((time) =>
    //     this.showTimeRepository.create({
    //       showId: show.id,
    //       showTime: time,
    //     }),
    //   );

    //   // show_image 테이블에 데이터 저장
    //   // const showImages = images.map((image) =>
    //   //   this.showImageRepository.create({
    //   //     showId: show.id,
    //   //     imageUrl: image,
    //   //   }),
    //   // );

    //   // queryRunner를 병렬로 처리해서 데이터베이스에 저장
    //   await Promise.all([
    //     queryRunner.manager.save(showPrice),
    //     queryRunner.manager.save(showTimes),
    //     // queryRunner.manager.save(showImages),
    //   ]);

    //   // show_place 테이블에 데이터 저장
    //   const totalSeat: number = seatA + (seatS ?? 0) + (seatR ?? 0) + (seatVip ?? 0);
    //   const showPlace = showTimes.map((showTime) =>
    //     this.showPlaceRepository.create({
    //       showId: show.id,
    //       showTimeId: showTime.id,
    //       placeName,
    //       totalSeat,
    //       seatA,
    //       seatS,
    //       seatR,
    //       seatVip,
    //     }),
    //   );
    //   await queryRunner.manager.save(showPlace);

    //   // 장소(시간)별, 등급별 좌석 정보 추가하기
    //   for (let k = 0; k < showPlace.length; k++) {
    //     let seatNumber = 1;
    //     // A 좌석 데이터 저장
    //     for (let i = 1; i <= showPlace[k].seatA; i++) {
    //       await queryRunner.manager.save(
    //         this.seatService.createSeat(
    //           show.id,
    //           showPlace[k].showTimeId,
    //           seatNumber,
    //           Grade.A,
    //           showPrice.priceA,
    //         ),
    //       );
    //       seatNumber++;
    //     }

    //     // S 좌석 데이터 저장
    //     for (let i = 1; i <= showPlace[k].seatS; i++) {
    //       await queryRunner.manager.save(
    //         this.seatService.createSeat(
    //           show.id,
    //           showPlace[k].showTimeId,
    //           seatNumber,
    //           Grade.S,
    //           showPrice.priceS,
    //         ),
    //       );
    //       seatNumber++;
    //     }

    //     // R 좌석 데이터 저장
    //     for (let i = 1; i <= showPlace[k].seatR; i++) {
    //       await queryRunner.manager.save(
    //         this.seatService.createSeat(
    //           show.id,
    //           showPlace[k].showTimeId,
    //           seatNumber,
    //           Grade.R,
    //           showPrice.priceR,
    //         ),
    //       );
    //       seatNumber++;
    //     }

    //     // Vip 좌석 데이터 저장
    //     for (let i = 1; i <= showPlace[k].seatVip; i++) {
    //       await queryRunner.manager.save(
    //         this.seatService.createSeat(
    //           show.id,
    //           showPlace[k].showTimeId,
    //           seatNumber,
    //           Grade.VIP,
    //           showPrice.priceVip,
    //         ),
    //       );
    //       seatNumber++;
    //     }
    //   }

    //   // 출력 형식 지정
    //   const createdShow = {
    //     id: show.id,
    //     title,
    //     content,
    //     runningTime,
    //     placeName,
    //     totalSeat,
    //     priceA,
    //     priceS,
    //     priceR,
    //     priceVip,
    //     showTimes: showTimes.map((time) => time.showTime),
    //     // showImages: showImages.map((image) => image.imageUrl),
    //     createdAt: show.createdAt,
    //     updatedAt: show.updatedAt,
    //   };

    //   await queryRunner.commitTransaction();
    //   return createdShow;
    // } catch (err) {
    //   await queryRunner.rollbackTransaction();
    //   // 트랜젝션 실패 시 S3 이미지도 롤백
    //   // await this.awsService.rollbackS3Image(images);
    //   throw new InternalServerErrorException(SHOW_MESSAGE.CREATE_SHOW.FAIL);
    // } finally {
    //   await queryRunner.release();
    // }
  }

  // 공연 목록 조회
  async findShowList(queryData: string) {
    const showList = await this.showRepository.find({
      // 쿼리 스트링을 통해 카테고리별로 조회
      where: queryData ? { category: Category[queryData.toUpperCase()] } : {},
      relations: {
        showImages: true,
        // showPlace: true,
        // showTimes: true,
      },
      order: { createdAt: 'DESC' },
    });

    // 출력 형식 지정
    const createdShowList = showList.map((show) => {
      return {
        id: show.id,
        title: show.title,
        category: show.category,
        // placeName: show.showPlace[0].placeName,
        // showTimes: show.showTimes.map((time) => time.showTime),
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
      .innerJoinAndSelect('show.showSchedules', 'showPlace')
      .innerJoinAndSelect('show.showImages', 'showImage')
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
        placeName: show.showSchedules[0].placeName,
        showTimes: show.showSchedules.map((schedule) => schedule.showTime),
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
        showSchedules: true,
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
      placeName: show.showSchedules[0].placeName,
      totalSeat: show.showSchedules[0].totalSeat,
      priceA: show.showPrice.priceA,
      priceS: show.showPrice.priceS,
      priceR: show.showPrice.priceR,
      priceVip: show.showPrice.priceVip,
      // 날짜별 잔여 좌석 수
      showPlaces: show.showSchedules.map((schedule) => {
        return {
          seatA: schedule.seatA,
          seatS: schedule.seatS,
          seatR: schedule.seatR,
          seatVip: schedule.seatVip,
        };
      }),
      showTimes: show.showSchedules.map((schedule) => schedule.showTime),
      showImages: show.showImages.map((image) => image.imageUrl),
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

  // 공연 일정 ID를 통해 공연 일정 정보를 반환 (시간 + 장소 데이터)
  async findShowScheduleById(showScheduleId: number) {
    return await this.showScheduleRepository.findOne({
      where: { id: showScheduleId },
    });
  }

  // 공연 장소의 좌석 수 수정
  updatedShowPlaceSeatCount(place: ShowSchedule, condition: object) {
    return this.showScheduleRepository.merge(place, condition);
  }
}
