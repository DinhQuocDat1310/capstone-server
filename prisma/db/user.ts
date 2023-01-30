import {
  FAKE_LOGO,
  FAKE_TYPE_BUSINESS,
  FAKE_OWNER_BUSINESS,
  FAKE_LICENSE,
  FAKE_BACK_CARDLICENSE,
  FAKE_FRONT_CARDLICENSE,
  FAKE_IMAGE_CAR,
} from './../../src/constants/fake-data';
import { Prisma, Role, StatusUser } from '@prisma/client';
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
    status: StatusUser.VERIFIED,
  };

  managers.push({
    email: 'nguyenlase141102@fpt.edu.vn',
    password,
    role: Role.MANAGER,
    fullname: 'Lê Anh Nguyên',
    status: StatusUser.VERIFIED,
    manager: {
      create: {},
    },
  });

  for (let i = 0; i < 4; i++) {
    managers.push({
      email: `manager${i + 1}@gmail.com`,
      password,
      role: Role.MANAGER,
      fullname: `Manager ${i + 1}`,
      status: StatusUser.VERIFIED,
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
  brands.push({
    email: 'tailmse140555@fpt.edu.vn',
    password,
    role: Role.BRAND,
    status: 'VERIFIED',
    imageCitizenFront: FAKE_FRONT_CARDLICENSE[2],
    imageCitizenBack: FAKE_BACK_CARDLICENSE[2],
    idCitizen: '065099999999',
    address: 'TP Hồ Chí Minh',
    brand: {
      create: {
        brandName: 'Pepsi',
        logo: 'https://www.designyourway.net/blog/wp-content/uploads/2018/07/maxresdefault-1.jpg',
        typeBusiness: FAKE_TYPE_BUSINESS[1],
        idLicenseBusiness: '123123123123',
        ownerLicenseBusiness: FAKE_OWNER_BUSINESS[1],
        imageLicenseBusiness: FAKE_LICENSE[1],
      },
    },
  });

  brands.push({
    email: 'nguyenla171120@gmaill',
    password,
    role: Role.BRAND,
    status: 'VERIFIED',
    imageCitizenFront: FAKE_FRONT_CARDLICENSE[3],
    imageCitizenBack: FAKE_BACK_CARDLICENSE[3],
    idCitizen: '065129999999',
    address: 'TP Hồ Chí Minh',
    brand: {
      create: {
        brandName: 'Phuc Long',
        logo: 'https://uploads-ssl.webflow.com/5fb85f26f126ce08d792d2d9/639d4fb26949fb0d309d5aba_logo-phuc-long-coffee-and-tea.jpg',
        typeBusiness: FAKE_TYPE_BUSINESS[2],
        idLicenseBusiness: '123123123923',
        ownerLicenseBusiness: FAKE_OWNER_BUSINESS[2],
        imageLicenseBusiness: FAKE_LICENSE[2],
      },
    },
  });

  for (let i = 0; i < 200; i++) {
    const random = Math.floor(Math.random() * 20);

    const randomIdCitizen = Math.floor(
      Math.random() * (Math.pow(10, 10) * 9.9 - Math.pow(10, 10) + 1) +
        Math.pow(10, 10),
    );
    const randomlicensePlates = 10000;

    drivers.push({
      imageCitizenFront: FAKE_FRONT_CARDLICENSE[random],
      imageCitizenBack: FAKE_BACK_CARDLICENSE[random],
      idCitizen: randomIdCitizen.toString(),
      address: i < 150 ? 'TP Hồ Chí Minh' : 'Hà Nội',
      email: `driver${i + 1}@gmail.com`,
      fullname: `Driver ${i + 1}`,
      role: Role.DRIVER,
      password,
      status: 'VERIFIED',
      driver: {
        create: {
          imageCarBack: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          imageCarFront: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          imageCarLeft: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          imageCarRight: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          licensePlates: `51F-${randomlicensePlates + i}`,
        },
      },
    });
  }

  // account fake
  drivers.push({
    imageCitizenFront: FAKE_FRONT_CARDLICENSE[1],
    imageCitizenBack: FAKE_BACK_CARDLICENSE[1],
    idCitizen: '075099999999',
    address: 'TP Hồ Chí Minh',
    email: 'dattxse140665@fpt.edu.vn',
    fullname: 'Trần Xuân Đạt',
    role: Role.DRIVER,
    password,
    status: 'VERIFIED',
    driver: {
      create: {
        imageCarBack: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
        imageCarFront: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
        imageCarLeft: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
        imageCarRight: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
        licensePlates: `51F-99999`,
      },
    },
  });
  drivers.push({
    imageCitizenFront: FAKE_FRONT_CARDLICENSE[2],
    imageCitizenBack: FAKE_BACK_CARDLICENSE[2],
    idCitizen: '075088888888',
    address: 'TP Hồ Chí Minh',
    email: 'mylike236@gmail.com',
    fullname: 'Trần Đạt',
    role: Role.DRIVER,
    password,
    status: 'VERIFIED',
    driver: {
      create: {
        imageCarBack: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
        imageCarFront: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
        imageCarLeft: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
        imageCarRight: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
        licensePlates: `51F-888888`,
      },
    },
  });
  drivers.push({
    imageCitizenFront: FAKE_FRONT_CARDLICENSE[3],
    imageCitizenBack: FAKE_BACK_CARDLICENSE[3],
    idCitizen: '075077777777',
    address: 'TP Hồ Chí Minh',
    email: 'dattranxuan0509@gmail.com',
    fullname: 'Đạt',
    role: Role.DRIVER,
    password,
    status: 'VERIFIED',
    driver: {
      create: {
        imageCarBack: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
        imageCarFront: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
        imageCarLeft: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
        imageCarRight: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
        licensePlates: `51F-77777`,
      },
    },
  });

  for (let i = 0; i < 5; i++) {
    reporter.push({
      email: `reporter${i + 1}@gmail.com`,
      password,
      role: Role.REPORTER,
      fullname: `Reporter ${i + 1}`,
      status: StatusUser.VERIFIED,
      reporter: {
        create: {},
      },
    });
  }
  return [...managers, ...drivers, ...brands, admin, ...reporter];
};
