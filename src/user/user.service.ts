import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // private readonly jwtService: JwtService,
  ) {}

  async signUp(email: string, password: string, passwordCheck: string, nickname: string) {
    if (password !== passwordCheck) {
      throw new BadRequestException('비밀번호 확인과 일치하지 않습니다.');
    }

    const existingUser = await this.findByEmail(email, nickname);
    if (existingUser) {
      throw new ConflictException('이미 해당 이메일로 가입된 사용자가 있습니다.');
    }

    const hashedPassword = await hash(password, 10);
    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      nickname,
    });

    user.password = undefined;
    return user;
  }

  // 이메일 중복 체크
  async findByEmail(email: string, nickname: string) {
    return await this.userRepository.findOne({
      where: [{ email }, { nickname }],
    });
  }
}
