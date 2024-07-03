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
    // @InjectRepository는 어떤 엔티티(테이블)을 주입해서 사용할지 정의하는 데코레이터
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
    let showImages: string[];

    try {
      // 이미지 데이터를 업로드
      showImages = await this.awsService.imageUpload(files);

      console.log(showImages);

      // show 테이블에 데이터 저장
      const show = await queryRunner.manager.save(
        this.showRepository.create({
          title,
          content,
          category,
          runningTime,
        }),
      );

      // show_place 테이블에 데이터 저장
      const showPlace = await queryRunner.manager.save(
        this.showPlaceRepository.create({
          showId: show.id,
          placeName,
          totalSeat: seatA + (seatS ?? 0) + (seatR ?? 0) + (seatVip ?? 0),
          seatA,
          seatS,
          seatR,
          seatVip,
        }),
      );

      // show_price 테이블에 데이터 저장
      const showPrice = await queryRunner.manager.save(
        this.showPriceRepository.create({
          showId: show.id,
          priceA,
          priceS,
          priceR,
          priceVip,
        }),
      );

      // show_time 테이블에 데이터 저장
      const showTimes = await queryRunner.manager.save(
        await Promise.all(
          times.map(async (time) => {
            return this.showTimeRepository.create({
              showId: show.id,
              showTime: time,
              show,
            });
          }),
        ),
      );

      // show_image 테이블에 데이터 저장
      await queryRunner.manager.save(
        await Promise.all(
          showImages.map(async (image) => {
            return this.showImageRepository.create({
              showId: show.id,
              imageUrl: image,
            });
          }),
        ),
      );

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
      await this.awsService.rollbackS3Image(showImages);
      throw new InternalServerErrorException('공연 등록에 실패했습니다.');
    } finally {
      await queryRunner.release();
    }
  }
}
