import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    // DTO를 사용하기 위한 필수 옵션
    new ValidationPipe({
      // json형태로 받은 입력을 DTO로 변환한다는 의미
      transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
