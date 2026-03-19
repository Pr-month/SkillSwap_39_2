import { Injectable } from '@nestjs/common';

type User = {
  id: number;
  email: string;
  password: string;
};

@Injectable()
export class UsersService {
  // Временная "база" пользователей
  private readonly users: User[] = [
    {
      id: 1,
      email: 'user@example.com',
      password: 'password123',
    },
  ];

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }
}
