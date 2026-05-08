import { SeedUserData } from './seed-user.data';

export interface SeedCreateSkill {
  title: string;
  description: string;
  images?: string[];
  categoryName: string;
  email: string;
}

export const SeedSkillData: SeedCreateSkill[] = [
  {
    title: 'Игра на барабанах',
    description: 'Привет! Научу базовым ритмам, постановке рук и динамике.',
    categoryName: 'Ударные',
    email: SeedUserData[0].email,
  },
  {
    title: 'React для начинающих',
    description: 'Компоненты, хуки, роутинг, best practices.',
    categoryName: 'Frontend',
    email: SeedUserData[1].email,
  },
  {
    title: 'Английский для путешествий',
    description:
      'Разговорные шаблоны, аудирование, базовая грамматика и словарь для поездок.',
    categoryName: 'Английский язык',
    email: SeedUserData[2].email,
  },
  {
    title: 'Маркетинг и реклама: стратегия и креативы',
    description:
      'Позиционирование, УТП, воронка, тест гипотез и разбор рекламных креативов.',
    categoryName: 'Маркетинг и реклама',
    email: SeedUserData[3].email,
  },
];
