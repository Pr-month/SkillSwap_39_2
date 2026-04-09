import { UserRole } from '../users/users.enums';

export const SeedUserData = [
  {
    name: 'Иван Петров',
    email: 'ivan.petrov@example.com',
    password: 'password123',
    role: UserRole.USER,
  },
  {
    name: 'Анна Смирнова',
    email: 'anna.smirnova@example.com',
    password: 'qwerty456',
    role: UserRole.USER,
  },
  {
    name: 'Дмитрий Козлов',
    email: 'dmitry.kozlov@example.com',
    password: 'secret789',
    role: UserRole.USER,
  },
  {
    name: 'Елена Волкова',
    email: 'elena.volkova@example.com',
    password: 'mypass123',
    role: UserRole.USER,
  },
];
