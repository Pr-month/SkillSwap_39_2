import { dbConfig } from 'src/config/db.config';
import { DataSource } from 'typeorm';
import { seedCategories } from './seed-category';
import { seedCities } from './seed-cities';
import { seedUser } from './seed-user';
import { seedSkills } from './seed-skill';
import { seedAdmin } from './seed-admin';

export async function SeedTestDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      `Этот скрипт можно запускать только в test окружении. Текущее: ${process.env.NODE_ENV}`,
    );
  }

  const dataSource = new DataSource(dbConfig());

  try {
    await dataSource.initialize();
    console.log('Подключение к БД установлено');

    await dataSource.synchronize(true);
    console.log('Схема БД сброшена и пересоздана');

    console.log('Заполнение тестовыми данными...');

    await seedCategories(dataSource);
    await seedCities(dataSource);
    await seedUser(dataSource);
    await seedAdmin(dataSource);
    await seedSkills(dataSource);
  } catch (error) {
    console.error('Ошибка при подготовке тестовой БД:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Сидинг завершен');
    }
  }
}

if (require.main === module) {
  SeedTestDatabase().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
