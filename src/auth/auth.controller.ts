import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async register(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(
      signUpDto.email,
      signUpDto.password,
      signUpDto.passwordCheck,
      signUpDto.nickname,
    );
  }

  //   @Post('sign-in')
  //   async login(@Body() signInDto: SignInDto) {
  //     return await this.authService.signIn(signInDto);
  //   }
}
