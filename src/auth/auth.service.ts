import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async registerUser(
    email: string,
    password: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await this.usersService.createUser(email, password);

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return { user, accessToken, refreshToken };
  }
}
