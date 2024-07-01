import {
  BadRequestException,
  ConflictException,
  Injectable,
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

@Injectable()
export class AuthService {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userService: UserService,

    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  // 회원가입
  async signUp(email: string, password: string, passwordCheck: string, nickname: string) {
    // const user = await this.userService.signUp(email, password, passwordCheck, nickname);

    if (password !== passwordCheck) {
      throw new BadRequestException('비밀번호 확인과 일치하지 않습니다.');
    }

    // 이메일 중복 체크
    let existedUser = await this.userService.findByEmail(email);
    if (existedUser) {
      throw new ConflictException('이미 해당 이메일로 가입된 사용자가 있습니다.');
    }

    // 닉네임 중복 체크
    existedUser = await this.userService.findByNickname(nickname);
    if (existedUser) {
      throw new ConflictException('이미 해당 닉네임으로 가입된 사용자가 있습니다.');
    }

    // 비밀번호 암호화
    const hashedPassword = await hash(password, 10);

    // 사용자 데이터베이스에 저장
    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      nickname,
    });

    // 비밀번호 제외하고 반환
    user.password = undefined;
    return user;
  }

  // 로그인
  async signIn(email: string, password: string) {
    // 이메일로 사용자 조회 (비밀번호 있는 데이터 가져오기)
    const user = await this.userService.findByEmail(email, true);
    if (_.isNil(user)) {
      throw new UnauthorizedException('일치하는 사용자가 없습니다.');
    }

    // 암호화된 비밀번호 일치 검사
    const isComparePassword = await compare(password, user.password);
    if (!isComparePassword) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }

    // 토큰 발급
    const accessToken = this.jwtService.sign({ id: user.id });
    const refreshToken = this.jwtService.sign({ id: user.id });

    console.log(user);
    // Refresh Token 저장
    await this.refreshTokenRepository.upsert(
      {
        userId: user.id,
        token: refreshToken,
      },
      ['token'],
    );

    return { accessToken, refreshToken };
  }
}
