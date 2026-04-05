import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { AppDataSource } from '../config/db.config';
import { SeedUserData } from './seed-user.data';
import { appConfig, TAppConfig } from '../config/app.config';

async function seedUser() {
  await AppDataSource.initialize();

  AppDataSource.setOptions({
    logging: false,
  });

  const userRepository = AppDataSource.getRepository(User);

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

seedUser()
  .catch((error) => console.log('Error seeding user:', error))
  .finally(() => {
    if (AppDataSource.isInitialized) {
      AppDataSource.destroy();
    }
  });
