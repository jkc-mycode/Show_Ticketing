import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { AUTH_CONSTANT } from 'src/constants/auth/auth.constant';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    // Passport 모듈을 다른 auth 모듈에서 사용하기 위한 코드
    PassportModule.register({
      defaultStrategy: AUTH_CONSTANT.COMMON.JWT,
      session: false,
    }),
    // JwtModule이라는 동적 모듈을 설정하고 다른 auth 모듈에서 사용하기 위한 코드
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(AUTH_CONSTANT.JWT.JWT_SECRET_KEY),
        signOptions: { expiresIn: AUTH_CONSTANT.JWT.REFRESH_EXPIRES_IN },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([RefreshToken]),
    UserModule,
  ],
  providers: [JwtStrategy, AuthService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
