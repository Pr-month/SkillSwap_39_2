import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { SeedUserData } from './seed-user.data';
import { appConfig, TAppConfig } from '../config/app.config';
import { DataSource } from 'typeorm';

export async function seedUser(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const userCount = await userRepository.count();
  if (userCount > 0) {
    console.log('Users already exist. Skipping seeding.');
    return;
  }

  const appConfigInstance: TAppConfig = appConfig();
  const saltRounds: number = appConfigInstance.hashSalt;

  const usersToSave: User[] = [];
  for (const userData of SeedUserData) {
    // Хэшируем пароль
    const hashedPassword: string = await bcrypt.hash(
      userData.password,
      saltRounds,
    );

    // Создаём экземпляр пользователя с хэшированным паролем
    const user: User = userRepository.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
    });

    usersToSave.push(user);
  }

  await userRepository.save(usersToSave);

  console.log('User seeded successfully');
}
