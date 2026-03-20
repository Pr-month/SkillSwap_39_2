import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async logout(userId: string): Promise<void> {
    await this.usersService.removeRefreshToken(userId);
  }
}
