import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { TAppConfig } from '../config/app.config';
import { UserRole } from '../users/users.enums';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<TAppConfig>('APP_CONFIG');

  if (!appConfig || !appConfig.adminData) {
    console.error('Admin data not found in config');
    await app.close();
    return;
  }

  const { email } = appConfig.adminData;

  try {
    const existingAdmin = await usersService.findByEmail(email);

    if (existingAdmin) {
      console.log('Admin already exists. Skipping...');
    } else {
      const admin = await usersService.createUser(appConfig.adminData);
      admin.role = UserRole.ADMIN;
      admin.name = 'Admin';
      await usersService.updateUser(admin.id, admin);
      console.log('Admin created successfully');
    }
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
