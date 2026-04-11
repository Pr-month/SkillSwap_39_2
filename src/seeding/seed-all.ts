import { dbConfig } from "src/config/db.config";
import { DataSource } from "typeorm";
import { seedCategories } from "./seed-category";
import { seedCities } from "./seed-cities";
import { seedUser } from "./seed-user";
import { seedSkills } from "./seed-skill";
import { seedAdmin } from "./seed-admin";

export async function runAllSeeds() {
  console.log('Запуск сидинга');

  const dataSource = new DataSource(dbConfig());

  try {
    await dataSource.initialize();
    console.log('Подключение к БД установлено');
    await seedCategories(dataSource);
    await seedCities(dataSource);
    await seedUser(dataSource);
    await seedAdmin(dataSource);
    await seedSkills(dataSource);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Сидинг завершен');
    }
  }
}

runAllSeeds().catch((error) => {
  console.error('Ошибка:', error);
  process.exit(1);
});