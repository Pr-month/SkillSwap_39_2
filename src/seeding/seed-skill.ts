import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';

import { SeedSkillData } from './seed-skill.data';
import { DataSource } from 'typeorm';

export async function seedSkills(dataSource: DataSource) {
  const skillRepository = dataSource.getRepository(Skill);
  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);

  const skillCount = await skillRepository.count();
  if (skillCount > 0) {
    console.log('Skills already exist. Skipping seeding.');
    return;
  }

  for (const skillData of SeedSkillData) {
    const owner = await userRepository.findOne({
      where: { email: skillData.email },
    });

    if (!owner) {
      throw new Error(`Owner not found: ${skillData.email}`);
    }

    const category = await categoryRepository.findOne({
      where: { name: skillData.categoryName },
    });

    if (!category) {
      throw new Error(`Category not found: ${skillData.categoryName}`);
    }

    const existing = await skillRepository.findOne({
      where: { title: skillData.title, userId: owner.id },
    });

    if (existing) continue;

    const skill = skillRepository.create({
      title: skillData.title,
      description: skillData.description,
      images: skillData.images ?? [],

      category,
      owner,

      userId: owner.id,
    });

    await skillRepository.save(skill);
  }

  console.log('Skills seeded successfully');
}
