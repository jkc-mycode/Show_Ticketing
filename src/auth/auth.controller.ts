import { Controller, Post, Body, UseGuards, Patch, Request, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UserInfo } from 'src/utils/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { RefreshTokenGuard } from './utils/refresh-token.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { HTTP_STATUS } from 'src/constants/common/http-status';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 회원가입
   * @param signUpDto
   * @returns
   */
  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(
      signUpDto.email,
      signUpDto.password,
      signUpDto.passwordCheck,
      signUpDto.nickname,
    );
  }

  /**
   * 로그인
   * @param req
   * @param signInDto
   * @returns
   */
  @UseGuards(AuthGuard('local'))
  @HttpCode(HTTP_STATUS.OK)
  @Post('/sign-in')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signIn(@Request() req, @Body() signInDto: SignInDto) {
    return await this.authService.signIn(req.user);
  }

  /**
   * 로그아웃
   * @param user
   * @returns
   */
  // Refresh Token가 유효한지 RefreshToken 가드로 확인
  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @Post('/sign-out')
  async signOut(@UserInfo() user: User) {
    return await this.authService.signOut(user);
  }

  /**
   * 토큰 재발급
   * @param user
   * @returns
   */
  // 토큰 재발급
  // Refresh Token가 유효한지 RefreshToken 가드로 확인
  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @Patch('/refresh')
  async refresh(@UserInfo() user: User) {
    return await this.authService.refresh(user);
  }
}
