import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { TicketService } from 'src/ticket/ticket.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => TicketService))
    private readonly ticketService: TicketService,
  ) {}

  // 사용자 생성
  async createUser(email: string, password: string, nickname: string) {
    return await this.userRepository.save({
      email,
      password,
      nickname,
    });
  }

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

  // 사용자 예매 목록 조회
  async findUserTicketsList(user: User) {
    const userId = user.id;
    const tickets = await this.ticketService.findTicketsByUserId(userId);

    return tickets;
  }

  // 사용자 포인트 수정
  updateUserPoint(user: User, updatedPoint: number) {
    return this.userRepository.merge(user, { point: updatedPoint });
  }
}
