import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import _ from 'lodash';
import { AUTH_CONSTANT } from 'src/constants/auth/auth.constant';
import { AUTH_MESSAGE } from 'src/constants/auth/auth.message.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get(AUTH_CONSTANT.JWT.JWT_SECRET_KEY),
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findByUserId(payload.id);
    if (_.isNil(user) || user.id !== payload.id) {
      throw new NotFoundException(AUTH_MESSAGE.COMMON.USER.NOT_FOUND);
    }

    return user;
  }
}
