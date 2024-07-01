import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private userService: UserService,
  ) {}

  async signUp(email: string, password: string, passwordCheck: string, nickname: string) {
    const user = await this.userService.signUp(email, password, passwordCheck, nickname);
    return user;
  }
}
