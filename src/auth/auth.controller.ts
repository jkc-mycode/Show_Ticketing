import { Controller, Post, Body, UseGuards, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UserInfo } from 'src/utils/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { RefreshTokenGuard } from './utils/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입
  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(
      signUpDto.email,
      signUpDto.password,
      signUpDto.passwordCheck,
      signUpDto.nickname,
    );
  }

  // 로그인
  @Post('/sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto.email, signInDto.password);
  }

  // 로그아웃
  // Refresh Token가 유효한지 RefreshToken 가드로 확인
  @UseGuards(RefreshTokenGuard)
  @Post('/sign-out')
  async signOut(@UserInfo() user: User) {
    return await this.authService.signOut(user);
  }

  // 토큰 재발급
  // Refresh Token가 유효한지 RefreshToken 가드로 확인
  @UseGuards(RefreshTokenGuard)
  @Patch('/refresh')
  async refresh(@UserInfo() user: User) {
    return await this.authService.refresh(user);
  }
}
