export interface SeedCreateSkill {
  title: string;
  description: string;
  name: string;
  images?: string[];
  categoryName: string;
  email: string;
}

export const SeedSkillData: SeedCreateSkill[] = [
  {
    title: 'Игра на барабанах',
    name: 'drums',
    description: 'Привет! Научу базовым ритмам, постановке рук и динамике.',
    categoryName: 'Ударные',
    email: 'ivan.petrov@example.com',
  },
  {
    title: 'React для начинающих',
    name: 'react-basic',
    description: 'Компоненты, хуки, роутинг, best practices.',
    categoryName: 'Frontend',
    email: 'anna.smirnova@example.com',
  },
  {
    title: 'Английский для путешествий',
    name: 'english-travel',
    description: 'Разговорные шаблоны, аудирование, базовая грамматика и словарь для поездок.',
    categoryName: 'Английский язык',
    email: 'dmitry.kozlov@example.com',
  },
  {
    title: 'Маркетинг и реклама: стратегия и креативы',
    name: 'marketing-ads-strategy',
    description: 'Позиционирование, УТП, воронка, тест гипотез и разбор рекламных креативов.',
    categoryName: 'Маркетинг и реклама',
    email: 'elena.volkova@example.com',
  },
];