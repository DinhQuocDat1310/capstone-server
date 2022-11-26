import {
  FAKE_LOGO,
  FAKE_TYPE_BUSINESS,
  FAKE_ADDRESS,
  FAKE_OWNER_BUSINESS,
  FAKE_LICENSE,
  FAKE_BACK_CARDLICENSE,
  FAKE_FRONT_CARDLICENSE,
  FAKE_IMAGE_CAR,
} from './../../src/constants/fake-data';
import { Prisma, Role, UserStatus } from '@prisma/client';
import { hash } from 'bcrypt';
export const users = async (): Promise<any[]> => {
  const password: string = await hash('123456aA!', 10);
  const brands: Prisma.UserCreateInput[] = [];
  const drivers: Prisma.UserCreateInput[] = [];
  const managers: Prisma.UserCreateInput[] = [];
  const reporter: Prisma.UserCreateInput[] = [];

  const admin: Prisma.UserCreateInput = {
    email: 'admin@gmail.com',
    password,
    role: Role.ADMIN,
    fullname: 'admin',
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
    const randomIdCitizen = Math.floor(
      Math.random() * (Math.pow(10, 10) * 9.9 - Math.pow(10, 10) + 1) +
        Math.pow(10, 10),
    );
    const randomIdLicense = Math.floor(
      Math.random() * (Math.pow(10, 12) * 9.9 - Math.pow(10, 12) + 1) +
        Math.pow(10, 12),
    );

    brands.push({
      email: `brand${i + 1}@gmail.com`,
      password,
      role: Role.BRAND,
      status: 'VERIFIED',
      imageCitizenFront: FAKE_FRONT_CARDLICENSE[i],
      imageCitizenBack: FAKE_BACK_CARDLICENSE[i],
      idCitizen: randomIdCitizen.toString(),
      address: i < 15 ? 'TP Hồ Chí Minh' : 'Hà Nội',
      brand: {
        create: {
          brandName: `Brand ${i + 1}`,
          logo: FAKE_LOGO[i],
          typeBusiness: FAKE_TYPE_BUSINESS[i],
          idLicenseBusiness: randomIdLicense.toString(),
          ownerLicenseBusiness: FAKE_OWNER_BUSINESS[i],
          imageLicenseBusiness: FAKE_LICENSE[i],
        },
      },
    });
  }

  for (let i = 0; i < 1000; i++) {
    const random = Math.floor(Math.random() * 20);

    const randomIdCitizen = Math.floor(
      Math.random() * (Math.pow(10, 10) * 9.9 - Math.pow(10, 10) + 1) +
        Math.pow(10, 10),
    );
    const randomIdCar = Math.floor(
      Math.random() * (Math.pow(10, 5) * 9.9 - Math.pow(10, 5) + 1) +
        Math.pow(10, 5),
    );
    const randomAccountNumber = Math.floor(
      Math.random() * (Math.pow(10, 5) * 9.9 - Math.pow(10, 5) + 1) +
        Math.pow(10, 5),
    );
    const randomPhone =
      Math.floor(Math.random() * (999999999 - 100000000)) + 100000000;

    drivers.push({
      imageCitizenFront: FAKE_FRONT_CARDLICENSE[random],
      imageCitizenBack: FAKE_BACK_CARDLICENSE[random],
      idCitizen: randomIdCitizen.toString(),
      address: i < 800 ? 'TP Hồ Chí Minh' : 'Hà Nội',
      email: `driver${i + 1}@gmail.com`,
      fullname: `Driver ${i + 1}`,
      role: Role.DRIVER,
      password,
      status: 'VERIFIED',
      phoneNumber: `+84${randomPhone + i}`,
      driver: {
        create: {
          imageCarBack: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          imageCarFront: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          imageCarLeft: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          imageCarRight: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          idCar: `51F-${randomIdCar}`,
          bankName: i < 60 ? 'TP BANK' : 'AGRIBANK',
          bankAccountNumber: `${randomAccountNumber}`,
          bankAccountOwner: FAKE_OWNER_BUSINESS[random],
        },
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
