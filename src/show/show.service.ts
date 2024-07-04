import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Show } from './entities/show.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateShowDto } from './dto/create-show.dto';
import { ShowImage } from './entities/showImage.entity';
import { ShowTime } from './entities/showTime.entity';
import { ShowPrice } from './entities/showPrice.entity';
import { ShowPlace } from './entities/showPlace.entity';
import { AwsService } from 'src/aws/aws.service';
import { Category } from './types/showCategory.type';
import { Seat } from 'src/seat/entities/seat.entity';
import { Grade } from 'src/seat/types/grade.type';

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
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
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
      images = await this.awsService.imageUpload(files);

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

      for (let k = 0; k < showPlace.length; k++) {
        let seatNumber = 1;
        for (let i = 1; i <= showPlace[k].seatA; i++) {
          await queryRunner.manager.save(
            this.seatRepository.create({
              showId: show.id,
              showTimeId: showPlace[k].showTimeId,
              seatNumber,
              grade: Grade.A,
              price: showPrice.priceA,
            }),
          );
          seatNumber++;
        }

        for (let i = 1; i <= showPlace[k].seatS; i++) {
          await queryRunner.manager.save(
            this.seatRepository.create({
              showId: show.id,
              showTimeId: showPlace[k].showTimeId,
              seatNumber,
              grade: Grade.S,
              price: showPrice.priceS,
            }),
          );
          seatNumber++;
        }

        for (let i = 1; i <= showPlace[k].seatR; i++) {
          await queryRunner.manager.save(
            this.seatRepository.create({
              showId: show.id,
              showTimeId: showPlace[k].showTimeId,
              seatNumber,
              grade: Grade.R,
              price: showPrice.priceR,
            }),
          );
          seatNumber++;
        }

        for (let i = 1; i <= showPlace[k].seatVip; i++) {
          await queryRunner.manager.save(
            this.seatRepository.create({
              showId: show.id,
              showTimeId: showPlace[k].showTimeId,
              seatNumber,
              grade: Grade.VIP,
              price: showPrice.priceVip,
            }),
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
      throw new InternalServerErrorException('공연 등록에 실패했습니다.');
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
      throw new NotFoundException('등록된 공연 정보가 없습니다.');
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
      showTimes: show.showTimes.map((time) => time.showTime),
      showPoster: show.showImages.map((image) => image.imageUrl),
      createdAt: show.createdAt,
      updatedAt: show.updatedAt,
    };

    return searchedShow;
  }
}
