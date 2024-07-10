import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { ShowImage } from 'src/show/entities/show-image.entity';
import { ShowPrice } from 'src/show/entities/show-price.entity';
import { ShowSchedule } from 'src/show/entities/show-schedule.entity';
import { Show } from 'src/show/entities/show.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { User } from 'src/user/entities/user.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const typeOrmModuleOptions = {
  // useFactory는 동적 모듈의 속성을 설정하기 위해 사용
  // useFactory에서 ConfigService를 주입받아 환경변수(.env)로부터
  // 데이터베이스 설정값을 가져와서 TypeOrmModuleOptions 객체를 반환함
  // eslint-disable-next-line prettier/prettier
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [User, RefreshToken, Show, ShowImage, ShowPrice, Seat, Ticket, ShowSchedule],
    // synchronize를 true로 사용하여 entity를 통해 Table을 생성할 때
    // Table의 column명이 snakeCase로 생성되는 것 또한 확인할 수 있음
    synchronize: configService.get('DB_SYNC'),
    logging: true,
  }),
  inject: [ConfigService],
};
