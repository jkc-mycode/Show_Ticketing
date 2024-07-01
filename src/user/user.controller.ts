import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from './entities/user.entity';

// 여기서의 가드는 역할을 따지지 않고 로그인했는지만 확인함
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly userService: UserService) {}

  // 사용자 프로필 조회
  @Get()
  async getUserInfo(@UserInfo() user: User) {
    return await this.userService.findByUserId(user.id);
  }
}
