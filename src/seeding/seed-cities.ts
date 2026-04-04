import * as fs from 'fs';
import * as path from 'path';

import { AppDataSource } from '../config/db.config';
import { City } from '../cities/entities/city.entity';

async function seedCities() {
  await AppDataSource.initialize();
  console.log('Database connected.');

  const cityRepository = AppDataSource.getRepository(City);

  const count = await cityRepository.count();
  if (count > 0) {
    console.log('Cities already exist.');
    await AppDataSource.destroy();
    return;
  }

  const filePath = path.join(__dirname, 'russian-cities.json');
  const rawData = fs.readFileSync(filePath, 'utf8');
  const citiesData = JSON.parse(rawData);

  console.log(`Seeding ${citiesData.length} cities.`);

  const cities = citiesData.map((c: any) =>
    cityRepository.create({
      name: c.name,
      subject: c.subject,
    }),
  );

  const chunkSize = 200;
  for (let i = 0; i < cities.length; i += chunkSize) {
    const chunk = cities.slice(i, i + chunkSize);
    await cityRepository.save(chunk);
    console.log(`Saved ${i + chunk.length} cities.`);
  }

  console.log('Success: Cities seeded!');
  await AppDataSource.destroy();
}

seedCities().catch((err) => console.error('Error:', err));
