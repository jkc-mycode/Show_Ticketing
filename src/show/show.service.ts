import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Show } from './entities/show.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateShowDto } from './dto/create-show.dto';
import { ShowImage } from './entities/showImage.entity';
import { ShowTime } from './entities/showTime.entity';
import { ShowPrice } from './entities/showPrice.entity';
import { ShowPlace } from './entities/showPlace.entity';
import { AwsService } from 'src/aws/aws.service';

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

      // show_place 테이블에 데이터 저장
      const showPlace = this.showPlaceRepository.create({
        showId: show.id,
        placeName,
        totalSeat: seatA + (seatS ?? 0) + (seatR ?? 0) + (seatVip ?? 0),
        seatA,
        seatS,
        seatR,
        seatVip,
      });

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
        queryRunner.manager.save(showPlace),
        queryRunner.manager.save(showPrice),
        queryRunner.manager.save(showTimes),
        queryRunner.manager.save(showImages),
      ]);

      // 출력 형식 지정
      const createdShow = {
        id: show.id,
        title: show.title,
        content: show.content,
        runningTime: show.runningTime,
        placeName: showPlace.placeName,
        totalSeat: showPlace.totalSeat,
        priceA: showPrice.priceA,
        priceS: showPrice.priceS,
        priceR: showPrice.priceR,
        priceVip: showPrice.priceVip,
        showTimes: showTimes.map((time) => time.showTime),
        showImages,
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
}