import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import Joi from 'joi';

const typeOrmModuleOptions = {
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
    entities: [],
    synchronize: configService.get('DB_SYNC'),
    logging: true,
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    // forRoot는 ConfigModule의 정적인(하드코딩된) 기초 설정을 위해 사용
    // 여기서는 Joi를 통한 유효성 검사 설정
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
        JWT_SECRET_KEY: Joi.string().required(),
      }),
    }),
    // forRootAsync는 TypeOrmModule의 동적인 기초 설정을 위해 사용 (환경변수나 데이터베이스)
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
