import { DataSource } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { CategoriesData } from './seed-category.data';

export async function seedCategories(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(Category);

  const categoryCount = await categoryRepository.count();
  if (categoryCount > 0) {
    console.log('Categories already exist. Skipping seeding.');
    return;
  }

  for (const category of CategoriesData) {
    // сохранить родительскую категорию
    const parent = categoryRepository.create({
      name: category.name,
    });
    await categoryRepository.save(parent);

    // при наличии дочерних категорий сохранить и их
    if (category.children) {
      const children = category.children.map((name) =>
        categoryRepository.create({
          name: name,
          parent: { id: parent.id },
          parentId: parent.id,
        }),
      );
      await categoryRepository.save(children);
    }
  }

  console.log('Categories seeded successfully');
}
