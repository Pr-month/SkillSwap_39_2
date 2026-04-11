import * as fs from 'fs';
import * as path from 'path';

import { City } from '../cities/entities/city.entity';
import { DataSource } from 'typeorm';

type CityData = {
  coords: {
    lat: string;
    lon: string;
  };
  district: string;
  name: string;
  population: number;
  subject: string;
};

export async function seedCities(dataSource: DataSource) {
  const cityRepository = dataSource.getRepository(City);

  const count = await cityRepository.count();
  if (count > 0) {
    console.log('Cities already exist. Skipping seeding.');
    return;
  }

  const filePath = path.join(__dirname, 'russian-cities.json');
  const rawData = fs.readFileSync(filePath, 'utf8');
  const citiesData: CityData[] = JSON.parse(rawData) as CityData[];

  console.log(`Seeding ${citiesData.length} cities.`);

  const cities = citiesData.map((c: CityData) =>
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
}
