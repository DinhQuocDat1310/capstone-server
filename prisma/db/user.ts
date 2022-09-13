import { Role } from '@prisma/client';
import { hash } from 'bcrypt';
export const users = async (): Promise<any[]> => {
  const password: string = await hash('123456aA!', 10);
  const brands = [];
  const drivers = [];
  const managers = [];

  for (let i = 0; i < 5; i++) {
    managers.push({
      email: `manager${i + 1}@gmail.com`,
      password,
      role: Role.MANAGER,
      fullname: `Manager ${i + 1}`,
      manager: {
        create: {},
      },
    });
  }
  for (let i = 0; i < 20; i++) {
    brands.push({
      email: `brand${i + 1}@gmail.com`,
      password,
      role: Role.BRAND,
      status: 'NEW',
      brand: {
        create: {
          brandName: `Brand ${i + 1}`,
        },
      },
    });
  }
  for (let i = 0; i < 100; i++) {
    drivers.push({
      phoneNumber: i >= 9 ? `+840000000${i + 1}` : `+8400000000${i + 1}`,
      fullname: `Driver ${i + 1}`,
      role: Role.DRIVER,
      password,
      status: 'NEW',
      driver: {
        create: {},
      },
    });
  }
  return [...managers, ...drivers, ...brands];
};
