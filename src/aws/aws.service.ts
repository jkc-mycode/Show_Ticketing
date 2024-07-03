// aws.service.ts
import { PutObjectCommand, S3, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';

@Injectable()
export class AwsService {
  s3Client: S3Client;
  s3: S3;

  constructor(private configService: ConfigService) {
    // AWS S3 클라이언트 초기화. 환경 설정 정보를 사용하여 AWS 리전, Access Key, Secret Key를 설정.
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_S3_REGION'), // AWS Region
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'), // Access Key
        secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'), // Secret Key
      },
    });
    // AWS S3 초기화. 환경 설정 정보를 사용하여 AWS 리전, Access Key, Secret Key를 설정.
    this.s3 = new S3({
      region: this.configService.get('AWS_S3_REGION'), // AWS Region
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'), // Access Key
        secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'), // Secret Key
      },
    });
  }

  // 이미지를 S3에 업로드
  async imageUploadToS3(
    fileName: string, // 업로드될 파일의 이름
    file: Express.Multer.File, // 업로드할 파일
    ext: string, // 파일 확장자
  ) {
    try {
      // AWS S3에 이미지 업로드 명령을 생성합니다. 파일 이름, 파일 버퍼, 파일 접근 권한, 파일 타입 등을 설정합니다.
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET'), // S3 버킷 이름
        Key: fileName, // 업로드될 파일의 이름
        Body: file.buffer, // 업로드할 파일
        ACL: 'public-read', // 파일 접근 권한
        ContentType: `image/${ext}`, // 파일 타입
      });

      // 생성된 명령을 S3 클라이언트에 전달하여 이미지 업로드를 수행합니다.
      await this.s3Client.send(command);
      // 업로드된 이미지의 URL을 반환합니다.
      return `https://s3.${process.env.AWS_S3_REGION}.amazonaws.com/${process.env.AWS_BUCKET}/${fileName}`;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('관리자에게 문의해 주세요.');
    }
  }

  // 받아온 파일 데이터 가공해서 aws 서비스에 전달
  async imageUpload(files: Express.Multer.File[]) {
    if (files.length === 0) {
      throw new BadRequestException('공연 이미지를 업로드해 주세요.');
    }

    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif'];

    // 오늘 날짜 구하기
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();
    const date = `${currentYear}-${currentMonth}-${currentDate}`;

    const imageUrls: string[] = [];

    await Promise.all(
      files.map(async (file) => {
        // 임의번호 생성
        let randomNumber: string = '';
        for (let i = 0; i < 8; i++) {
          randomNumber += String(Math.floor(Math.random() * 10));
        }

        // 확장자 검사
        const extension = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(extension)) {
          throw new Error('확장자 에러');
        }

        const imageName = `test/${date}_${randomNumber}`;
        const ext = file.originalname.split('.').pop();

        const imageUrl = await this.imageUploadToS3(`${imageName}.${ext}`, file, ext);
        imageUrls.push(imageUrl);
      }),
    );

    return imageUrls;
  }

  // 공연 등록 트랜젝션 실패시 S3에 등록된 이미지 롤백
  async rollbackS3Image(images: string[]) {
    for (const image of images) {
      const existingImageKey = await this.extractKeyFromUrl(image);
      if (existingImageKey) {
        await this.deleteImage(existingImageKey);
      }
    }
  }

  // URL에서 S3 key 추출 함수
  async extractKeyFromUrl(url: string) {
    const urlParts = url.split('/');
    // URL의 마지막 부분이 key가 됩니다.
    const key = urlParts.slice(3).join('/');
    return key;
  }

  // S3에 등록된 이미지 삭제
  async deleteImage(key: string) {
    try {
      const params = {
        Bucket: this.configService.get('AWS_BUCKET'),
        Key: key,
      };

      // S3에 접근해서 해당 이미지 객체 삭제
      await this.s3.deleteObject(params);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
