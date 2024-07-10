import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShowModule } from './show/show.module';
import { AwsModule } from './aws/aws.module';
import { SeatModule } from './seat/seat.module';
import { TicketModule } from './ticket/ticket.module';
import { configModuleValidationSchema } from 'configs/env-validation.config';
import { typeOrmModuleOptions } from 'configs/database.config';

@Module({
  imports: [
    // forRoot는 ConfigModule의 정적인(하드코딩된) 기초 설정을 위해 사용
    // 여기서는 Joi를 통한 유효성 검사 설정
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationSchema,
    }),
    // forRootAsync는 TypeOrmModule의 동적인 기초 설정을 위해 사용 (환경변수나 데이터베이스)
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    UserModule,
    ShowModule,
    AwsModule,
    SeatModule,
    TicketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
