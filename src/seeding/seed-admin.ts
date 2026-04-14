import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { appConfig, TAppConfig } from 'src/config/app.config';
import { UserRole } from 'src/users/users.enums';

export async function seedAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const appConfigInstance: TAppConfig = appConfig();
  const saltRounds: number = appConfigInstance.hashSalt;

  const adminData = appConfigInstance.adminData;

  try {
    const existingAdmin = await userRepository.findOne({
      where: { email: adminData.email },
    });

    if (existingAdmin) {
      console.log('Admin already exists. Skipping seeding.');
    } else {
      const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

      const admin: User = userRepository.create({
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
      });

      await userRepository.save(admin);

      console.log('Admin created successfully');
    }
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}
