import { Role } from '@prisma/client';
import { hash } from 'bcrypt';
import { CreateUserDTO } from '../../src/user/dto';
export const users = async (): Promise<CreateUserDTO[]> => {
  const password: string = await hash('123456aA!', 10);
  return [
    {
      brandName: 'Brand 1',
      email: 'brand1@gmail.com',
      password,
      role: Role.BRAND,
    },
    {
      brandName: 'Brand 2',
      email: 'brand2@gmail.com',
      password,
      role: Role.BRAND,
    },
    {
      brandName: 'Brand 3',
      email: 'brand3@gmail.com',
      password,
      role: Role.BRAND,
    },

    {
      phoneNumber: '+84311111111',
      fullname: 'Driver 1',
      role: Role.DRIVER,
      password,
    },
    {
      phoneNumber: '+84322222222',
      fullname: 'Driver 2',
      role: Role.DRIVER,
      password,
    },
    {
      phoneNumber: '+84333333333',
      fullname: 'Driver 3',
      role: Role.DRIVER,
      password,
    },

    {
      email: 'manager1@gmail.com',
      password,
      role: Role.MANAGER,
      fullname: 'Manager 1',
    },
    {
      email: 'manager2@gmail.com',
      password,
      role: Role.MANAGER,
      fullname: 'Manager 2',
    },
  ];
};
