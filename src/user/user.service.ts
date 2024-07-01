import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 사용자 ID로 사용자 조회 (사용자 프로필 조회)
  async findByUserId(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  // 이메일로 사용자 조회
  async findByEmail(email: string, requiredPw: boolean = false) {
    return await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: requiredPw,
        nickname: true,
        role: true,
        point: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // 닉네임으로 사용자 조회
  async findByNickname(nickname: string) {
    return await this.userRepository.findOne({
      where: { nickname },
    });
  }
}
