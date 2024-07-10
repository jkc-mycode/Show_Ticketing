import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AUTH_MESSAGE } from 'src/constants/auth/auth.message.constant';
// import { PickType } from '@nestjs/mapped-types';
import { User } from 'src/user/entities/user.entity';

export class SignUpDto extends PickType(User, ['email', 'password', 'nickname']) {
  /**
   * 비밀번호 확인
   * @example "123123"
   */
  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGE.DTO.PASSWORD_CHECK.IS_NOT_EMPTY })
  passwordCheck: string;
}
