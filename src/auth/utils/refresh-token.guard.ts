import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { AUTH_CONSTANT } from 'src/constants/auth/auth.constant';
import { AUTH_MESSAGE } from 'src/constants/auth/auth.message.constant';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 헤더에서 Refresh 토큰 가져옴
    const authorization = request.headers[AUTH_CONSTANT.UTIL.AUTHORIZATION];
    if (!authorization) throw new BadRequestException(AUTH_MESSAGE.REFRESH_TOKEN.BAD_REQUEST);

    // Refresh 토큰이 Bearer 형식인지 확인
    const [tokenType, token] = authorization.split(' ');
    if (tokenType !== AUTH_CONSTANT.UTIL.BEARER)
      throw new BadRequestException(AUTH_MESSAGE.REFRESH_TOKEN.BAD_REQUEST);

    try {
      // 서버에서 발급한 JWT가 맞는지 검증
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.REFRESH_SECRET_KEY,
      });

      // JWT에서 꺼낸 userId로 실제 사용자가 있는지 확인
      const user = await this.userService.findByUserId(payload.id);
      if (!user) throw new NotFoundException(AUTH_MESSAGE.REFRESH_TOKEN.NOT_FOUND);

      // DB에 저장된 RefreshToken를 조회
      const refreshToken = await this.authService.getRefreshToken(user.id);
      // DB에 저장 된 RefreshToken이 없거나 전달 받은 값과 일치하지 않는 경우
      if (!refreshToken || refreshToken.token !== token) {
        throw new UnauthorizedException(AUTH_MESSAGE.REFRESH_TOKEN.UNAUTHORIZED);
      }

      request['user'] = user;
    } catch {
      throw new UnauthorizedException(AUTH_MESSAGE.REFRESH_TOKEN.UNAUTHORIZED);
    }
    return true;
  }
}
