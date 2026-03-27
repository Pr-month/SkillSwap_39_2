import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AccessTokenPayload } from '../auth/auth.types';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject
} from '@nestjs/common';
import { appConfig, TAppConfig } from 'src/config/app.config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(appConfig.KEY)
    private readonly appConfig: TAppConfig
  ) {}

  

  async createUser(email: string, password: string): Promise<User> {
    const hashedPassword: string = await bcrypt.hash(password, 10);
    const user: User = this.usersRepository.create({
      email,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: null });
  }

  async findById(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: userId } });
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, dto);

    return this.usersRepository.save(user);
  }

  async updatePassword(
    payload: AccessTokenPayload,
    updatePasswordDTO: UpdatePasswordDto,
  ): Promise<User | null> {
    const user = await this.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (
      user.email !== payload.email ||
      user.email !== updatePasswordDTO.email
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    const hashedPassword: string = await bcrypt.hash(
      updatePasswordDTO.password,
      this.appConfig.hashSalt,
    );
    await this.usersRepository.update(user.id, { password: hashedPassword });

    return user;
  }
}
