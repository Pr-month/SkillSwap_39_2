import { Category } from "../categories/entities/category.entity";
import { AppDataSource } from "../config/db.config";
import { CategoriesData } from "./seed-category.data";

async function seedCategories() {
  await AppDataSource.initialize();

  AppDataSource.setOptions({
    logging: false
  });

  const categoryRepository = AppDataSource.getRepository(Category);
  
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
        })
      );
      await categoryRepository.save(children);
    }
  };

  console.log('Categories seeded successfully');
}

seedCategories()
  .catch((error) => console.log('Error seeding category:', error))
  .finally(() => {
    if (AppDataSource.isInitialized) {
      AppDataSource.destroy();
    }
  });
