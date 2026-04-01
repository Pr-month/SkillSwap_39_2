import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../users/users.enums';

@Injectable()
export class AdminSeed implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');

    if (!email || !password) {
      console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set');
      return;
    }

    const existingAdmin = await this.usersService.findByEmail(email);

    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const admin = await this.usersService.createUser(email, password);

    admin.role = UserRole.ADMIN;
    await this.usersService.updateUser(admin.id, admin);

    console.log('Admin created successfully');
  }
}
