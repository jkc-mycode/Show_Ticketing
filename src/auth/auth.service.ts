import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import _ from 'lodash';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { AUTH_CONSTANT } from 'src/constants/auth/auth.constant';
import { AUTH_MESSAGE } from 'src/constants/auth/auth.message.constant';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,

    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  // 회원가입
  async signUp(email: string, password: string, passwordCheck: string, nickname: string) {
    if (password !== passwordCheck) {
      throw new BadRequestException(AUTH_MESSAGE.SIGN_UP.PASSWORD.BAD_REQUEST);
    }

    // 이메일 중복 체크
    let existedUser = await this.userService.findByEmail(email);
    if (existedUser) {
      throw new ConflictException(AUTH_MESSAGE.SIGN_UP.EMAIL.CONFLICT);
    }

    // 닉네임 중복 체크
    existedUser = await this.userService.findByNickname(nickname);
    if (existedUser) {
      throw new ConflictException(AUTH_MESSAGE.SIGN_UP.NICKNAME.CONFLICT);
    }

    // 비밀번호 암호화
    const hashedPassword = await hash(password, AUTH_CONSTANT.COMMON.HASH.SALT);

    // 사용자 데이터베이스에 저장
    const user = await this.userService.createUser(email, hashedPassword, nickname);

    // 비밀번호 제외하고 반환
    user.password = undefined;
    return user;
  }

  // 로그인
  async signIn(email: string, password: string) {
    // 이메일로 사용자 조회 (비밀번호 있는 데이터 가져오기)
    const user = await this.userService.findByEmail(email, true);
    if (_.isNil(user)) {
      throw new NotFoundException(AUTH_MESSAGE.COMMON.USER.NOT_FOUND);
    }

    // 암호화된 비밀번호 일치 검사
    const isComparePassword = await compare(password, user.password);
    if (!isComparePassword) {
      throw new UnauthorizedException(AUTH_MESSAGE.SIGN_IN.PASSWORD.UNAUTHORIZED);
    }

    // 토큰 발급
    const accessToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: AUTH_CONSTANT.JWT.ACCESS_EXPIRES_IN },
    );
    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { secret: process.env.REFRESH_SECRET_KEY },
    );

    // Refresh Token 저장
    await this.refreshTokenRepository.upsert(
      {
        userId: user.id,
        token: refreshToken,
      },
      [AUTH_CONSTANT.COMMON.REFRESH_TOKEN.COLUMN_NAME],
    );

    return { accessToken, refreshToken };
  }

  // 사용자 ID를 통해 Refresh 토큰 조회
  async getRefreshToken(userId: number) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { userId },
    });

    return refreshToken;
  }

  // 로그아웃
  async signOut(user: User) {
    console.log(user);
    // 이미 로그아웃되었는지 확인
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { userId: user.id },
    });

    if (refreshToken.token === '') {
      throw new BadRequestException(AUTH_MESSAGE.SIGN_OUT.EXIST);
    }

    // Refresh Token 삭제 (soft delete)
    await this.refreshTokenRepository.update({ userId: user.id }, { token: null });

    return { message: AUTH_MESSAGE };
  }

  // 토큰 재발급
  async refresh(user: User) {
    // 토큰 발급
    console.log(user);
    const accessToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: AUTH_CONSTANT.JWT.ACCESS_EXPIRES_IN },
    );
    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { secret: process.env.REFRESH_SECRET_KEY },
    );

    // Refresh Token 저장
    await this.refreshTokenRepository.upsert(
      {
        userId: user.id,
        token: refreshToken,
      },
      [AUTH_CONSTANT.COMMON.REFRESH_TOKEN.COLUMN_NAME],
    );

    return { accessToken, refreshToken };
  }
}
