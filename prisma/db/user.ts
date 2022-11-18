import { FAKE_ADDRESS } from './../../src/constants/fake-data';
import { Role, UserStatus } from '@prisma/client';
import { hash } from 'bcrypt';
export const users = async (): Promise<any[]> => {
  const password: string = await hash('123456aA!', 10);
  const brands = [];
  const drivers = [];
  const managers = [];
  const reporter = [];
  const admin = {
    email: 'admin@gmail.com',
    password,
    role: Role.ADMIN,
    fullname: 'admin',
    isAdmin: true,
    status: UserStatus.VERIFIED,
  };

  for (let i = 0; i < 5; i++) {
    managers.push({
      email: `manager${i + 1}@gmail.com`,
      password,
      role: Role.MANAGER,
      fullname: `Manager ${i + 1}`,
      status: UserStatus.VERIFIED,
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

  for (let i = 0; i < FAKE_ADDRESS.length; i++) {
    reporter.push({
      email: `reporter${i + 1}@gmail.com`,
      phoneNumber: i >= 9 ? `+8400000${i + 999}` : `+84000000${i + 999}`,
      password,
      role: Role.REPORTER,
      fullname: `Reporter ${i + 1}`,
      status: UserStatus.VERIFIED,
      address: FAKE_ADDRESS[i],
      reporter: {
        create: {},
      },
    });
  }
  return [...managers, ...drivers, ...brands, admin, ...reporter];
};
