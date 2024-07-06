import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';

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
    const authorization = request.headers['authorization'];
    if (!authorization) throw new UnauthorizedException('인증 정보가 없습니다.');

    // Refresh 토큰이 Bearer 형식인지 확인
    const [tokenType, token] = authorization.split(' ');
    if (tokenType !== 'Bearer') throw new UnauthorizedException('인증 정보가 없습니다.');

    try {
      // 서버에서 발급한 JWT가 맞는지 검증
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.REFRESH_SECRET_KEY,
      });

      // JWT에서 꺼낸 userId로 실제 사용자가 있는지 확인
      const user = await this.userService.findByUserId(payload.id);
      if (!user) throw new UnauthorizedException('인증 정보와 일치하는 사용자가 없습니다.');

      // DB에 저장된 RefreshToken를 조회
      const refreshToken = await this.authService.getRefreshToken(user.id);
      // DB에 저장 된 RefreshToken이 없거나 전달 받은 값과 일치하지 않는 경우
      if (!refreshToken || refreshToken.token !== token) {
        throw new UnauthorizedException('폐기된 인증 정보입니다.');
      }

      request['user'] = user;
    } catch {
      throw new UnauthorizedException('인증정보가 유효하지 않습니다.');
    }
    return true;
  }
}
