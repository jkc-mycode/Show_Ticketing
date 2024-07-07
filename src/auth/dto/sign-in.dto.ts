import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AUTH_MESSAGE } from 'src/constants/auth/auth.message.constant';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty({ message: AUTH_MESSAGE.DTO.EMAIL.IS_NOT_EMPTY })
  email: string;

  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGE.DTO.PASSWORD.IS_NOT_EMPTY })
  password: string;
}
