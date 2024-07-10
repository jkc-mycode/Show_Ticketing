import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/user-info.decorator';
import { User } from './entities/user.entity';
import { USER_CONSTANT } from 'src/constants/user/user.constant';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('사용자')
@ApiBearerAuth()
// 여기서의 가드는 역할을 따지지 않고 로그인했는지만 확인함
@UseGuards(AuthGuard(USER_CONSTANT.COMMON.JWT))
@Controller('users')
export class UserController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly userService: UserService) {}

  /**
   * 사용자 프로필 조회
   * @param user
   * @returns
   */
  @Get()
  async getUserInfo(@UserInfo() user: User) {
    return await this.userService.findByUserId(user.id);
  }

  // 사용자 예매 목록 조회
  @Get('/tickets')
  async findUserTicketsList(@UserInfo() user: User) {
    return await this.userService.findUserTicketsList(user);
  }
}
