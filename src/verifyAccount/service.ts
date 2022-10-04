import {
  FAKE_LOGO,
  FAKE_LICENSE,
  FAKE_BACK_CARDLICENSE,
  FAKE_FRONT_CARDLICENSE,
  FAKE_TYPE_BUSINESS,
  FAKE_ADDRESS,
  FAKE_OWNER_BUSINESS,
  FAKE_IMAGE_CAR,
} from './../constants/fake-data';
import { PrismaService } from './../prisma/service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ManagerVerifyDTO } from 'src/manager/dto';
import { UserStatus, VerifyAccountStatus } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { AppConfigService } from 'src/config/appConfigService';

@Injectable()
export class VerifyAccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly configService: AppConfigService,
  ) {}

  async createNewRequestVerifyBrandAccount(id: string) {
    try {
      return await this.prisma.verifyAccount.create({
        data: {
          brand: {
            connect: {
              id,
            },
          },
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async createPendingRequestVerifyDriverAccount(id: string, managerId: string) {
    const verify = await this.prisma.verifyAccount.findFirst({
      where: {
        brandId: id,
      },
      select: {
        createDate: true,
      },
      orderBy: {
        createDate: 'asc',
      },
    });
    try {
      return await this.prisma.verifyAccount.create({
        data: {
          status: VerifyAccountStatus.PENDING,
          driver: {
            connect: {
              id,
            },
          },
          manager: {
            connect: {
              id: managerId,
            },
          },
          createDate: verify.createDate,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async createPendingRequestVerifyBrandAccount(id: string, managerId: string) {
    const verify = await this.prisma.verifyAccount.findFirst({
      where: {
        brandId: id,
      },
      select: {
        createDate: true,
      },
      orderBy: {
        createDate: 'asc',
      },
    });
    try {
      return await this.prisma.verifyAccount.create({
        data: {
          status: VerifyAccountStatus.PENDING,
          brand: {
            connect: {
              id,
            },
          },
          manager: {
            connect: {
              id: managerId,
            },
          },
          createDate: verify.createDate,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async createNewRequestVerifyDriverAccount(id: string) {
    try {
      return await this.prisma.verifyAccount.create({
        data: {
          driver: {
            connect: {
              id,
            },
          },
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async assignVerifyAccountToManager(verifyId: string, managerId: string) {
    await this.prisma.verifyAccount.update({
      where: {
        id: verifyId,
      },
      data: {
        manager: {
          connect: {
            id: managerId,
          },
        },
      },
    });
  }

  async getListVerifyByUserId(userId: string) {
    return await this.prisma.verifyAccount.findMany({
      where: {
        OR: [
          {
            brand: {
              userId,
            },
          },
          {
            driver: {
              userId,
            },
          },
        ],
      },
      orderBy: {
        createDate: 'desc',
      },
    });
  }

  async getListVerifyPendingByManagerId(userId: string, type: string) {
    if (['driver', 'brand'].indexOf(type.toLowerCase()) === -1)
      throw new BadRequestException('The role is not valid!. please try again');

    const select = {
      id: true,
      status: true,
      detail: true,
      createDate: true,
      assignBy: true,
    };
    if (type === 'brand') {
      select['brand'] = {
        select: {
          ownerLicenseBusiness: true,
          idLicenseBusiness: true,
          typeBusiness: true,
          brandName: true,
          imageLicenseBusiness: true,
          logo: true,
          user: {
            select: {
              address: true,
              phoneNumber: true,
              idCitizen: true,
              imageCitizenFront: true,
              imageCitizenBack: true,
            },
          },
        },
      };
    }
    if (type === 'driver') {
      select['driver'] = {
        select: {
          idCar: true,
          imageCarRight: true,
          imageCarLeft: true,
          imageCarFront: true,
          imageCarBack: true,
          bankAccountNumber: true,
          bankAccountOwner: true,
          bankName: true,
          user: {
            select: {
              fullname: true,
              address: true,
              phoneNumber: true,
              idCitizen: true,
              imageCitizenFront: true,
              imageCitizenBack: true,
            },
          },
        },
      };
    }
    try {
      const verifies = await this.prisma.verifyAccount.findMany({
        where: {
          manager: {
            userId,
          },
          status: VerifyAccountStatus.PENDING,
        },
        select,
        orderBy: {
          createDate: 'asc',
        },
      });
      return verifies
        .map((verify) => {
          if (type === 'brand') {
            const user = verify['brand']?.user;
            delete verify['brand']?.user;
            verify['brand'] = {
              ...verify['brand'],
              ...user,
            };
          }
          if (type === 'driver') {
            const user = verify['driver']?.user;
            delete verify['driver']?.user;
            verify['driver'] = {
              ...verify['driver'],
              ...user,
            };
          }
          return verify;
        })
        .filter((verify) => Object.keys(verify[`${type}`]).length !== 0);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async managerVerifyAccount(userId: string, dto: ManagerVerifyDTO) {
    const verify = await this.prisma.verifyAccount.findFirst({
      where: {
        id: dto.verifyId,
        status: VerifyAccountStatus.PENDING,
        manager: {
          userId: userId,
        },
      },
      include: {
        brand: {
          select: {
            userId: true,
          },
        },
        driver: {
          select: {
            userId: true,
          },
        },
      },
    });
    const type = verify?.brand ? 'brand' : 'driver';
    if (!verify) {
      throw new BadRequestException(
        'This request is not pending anymore. Can you try another request!',
      );
    }
    await this.prisma.verifyAccount.update({
      where: {
        id: dto.verifyId,
      },
      data: {
        status: dto.action,
        detail: dto.detail,
      },
    });
    let status: UserStatus = 'PENDING';
    let message = '';
    switch (dto.action) {
      case 'ACCEPT':
        message = `<p>Congratulations!. Your ${type} information has been accepted</p>
           <p>Please login at the website for more details</p>`;
        status = UserStatus.VERIFIED;
        break;
      case 'BANNED':
        message = `<p>Your account has been banned for violating our terms</p>
           <p>Please contact ${this.configService.getConfig(
             'MAILER',
           )} for more information</p>`;
        status = UserStatus.BANNED;
        break;
      case 'UPDATE':
        message = `<p>The ${type} information you provided is not valid, please update so that Brandvertise's team can support as soon as possible.</p>
           <p>Please login at the website for more details</p>`;
        status = UserStatus.UPDATE;
        break;
    }
    const user = await this.prisma.user.update({
      where: {
        id: verify.brand ? verify.brand.userId : verify.driver.userId,
      },
      data: {
        status,
      },
      select: {
        fullname: true,
        email: true,
        status: true,
        brand: {
          select: {
            brandName: true,
          },
        },
      },
    });
    const name = type === 'driver' ? user.fullname : user.brand.brandName;
    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.getConfig('MAILER'),
      subject: 'Result verification account',
      html: `
       <p>Dear ${name},</p></br>
       <p>Thanks for becoming Brandvertise's partner!</p>
        ${message}
       <p>Regards,</p>
       <p style="color: green">Brandvertise</p>
    `,
    });
    return;
  }

  async getAllVerifyNew() {
    return await this.prisma.verifyAccount.findMany({
      where: {
        status: 'NEW',
      },
      select: {
        id: true,
      },
    });
  }

  async fakeAutoCreateVerifyRequest() {
    const users = await this.prisma.user.findMany({
      where: {
        status: 'NEW',
      },
      include: {
        brand: {
          include: {
            verify: true,
          },
        },
        driver: {
          include: {
            verify: true,
          },
        },
      },
    });

    const brandsFilter = users
      .filter((user) => user.brand?.verify?.length === 0)
      .filter((user) => user?.brand?.id);
    const driversFilter = users
      .filter((user) => user.driver?.verify?.length === 0)
      .filter((user) => user?.driver?.id);

    if (brandsFilter.length === 0 && driversFilter.length === 0) {
      return 'all account is on processing!';
    }
    const randomPhone =
      Math.floor(Math.random() * (999999999 - 100000000)) + 100000000;
    for (let i = 0; i < brandsFilter.length; i++) {
      const randomIdCitizen = Math.floor(
        Math.random() * (Math.pow(10, 10) * 9.9 - Math.pow(10, 10) + 1) +
          Math.pow(10, 10),
      );
      const randomIdLicense = Math.floor(
        Math.random() * (Math.pow(10, 12) * 9.9 - Math.pow(10, 12) + 1) +
          Math.pow(10, 12),
      );
      const random = Math.floor(Math.random() * 20);
      await this.prisma.brand.update({
        where: {
          id: brandsFilter[i].brand.id,
        },

        data: {
          idLicenseBusiness: randomIdLicense.toString(),
          ownerLicenseBusiness: FAKE_OWNER_BUSINESS[random],
          logo: FAKE_LOGO[random],
          typeBusiness: FAKE_TYPE_BUSINESS[random],
          imageLicenseBusiness: FAKE_LICENSE[random],
          user: {
            update: {
              status: 'PENDING',
              imageCitizenFront: FAKE_FRONT_CARDLICENSE[random],
              imageCitizenBack: FAKE_BACK_CARDLICENSE[random],
              idCitizen: randomIdCitizen.toString(),
              address: FAKE_ADDRESS[random],
              phoneNumber: `+84${randomPhone + i}`,
            },
          },
        },
      });
      await this.prisma.verifyAccount.create({
        data: {
          brand: {
            connect: {
              id: brandsFilter[i].brand.id,
            },
          },
        },
      });
    }
    for (let i = 0; i < driversFilter.length; i++) {
      const random = Math.floor(Math.random() * 20);
      const randomIdCitizend = Math.floor(
        Math.random() * (Math.pow(10, 10) * 9.9 - Math.pow(10, 10) + 1) +
          Math.pow(10, 10),
      );
      const randomIdCar = Math.floor(
        Math.random() * (Math.pow(10, 5) * 9.9 - Math.pow(10, 5) + 1) +
          Math.pow(10, 5),
      );
      await this.prisma.driver.update({
        where: {
          id: driversFilter[i].driver.id,
        },

        data: {
          imageCarBack: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          imageCarFront: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          imageCarLeft: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          imageCarRight: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          idCar: `TEST-${randomIdCar}`,
          bankName: 'AGRIBANK',
          bankAccountNumber: `${i}`,
          bankAccountOwner: FAKE_OWNER_BUSINESS[random],
          user: {
            update: {
              status: 'PENDING',
              fullname: FAKE_OWNER_BUSINESS[random],
              imageCitizenFront: FAKE_FRONT_CARDLICENSE[random],
              imageCitizenBack: FAKE_BACK_CARDLICENSE[random],
              idCitizen: randomIdCitizend.toString(),
              address: FAKE_ADDRESS[random],
              email: `driver${i}@gmail.com`,
            },
          },
        },
      });
      await this.prisma.verifyAccount.create({
        data: {
          driver: {
            connect: {
              id: driversFilter[i].driver.id,
            },
          },
        },
      });
    }

    return `Create ${
      brandsFilter.length + driversFilter.length
    } request verify NEW account`;
  }

  async getListHistoryVerifiedByManagerId(userId: string, type: string) {
    if (['driver', 'brand'].indexOf(type.toLowerCase()) === -1)
      throw new BadRequestException('The role is not valid!. please try again');

    const select = {};
    if (type === 'brand') {
      select['brand'] = {
        select: {
          id: true,
          logo: true,
          brandName: true,
          ownerLicenseBusiness: true,
          user: {
            select: {
              email: true,
              address: true,
            },
          },
        },
      };
    }

    if (type === 'driver') {
      select['driver'] = {
        select: {
          id: true,
          user: {
            select: {
              fullname: true,
              email: true,
              phoneNumber: true,
              address: true,
            },
          },
        },
      };
    }

    try {
      const verifieds = await this.prisma.verifyAccount.findMany({
        where: {
          manager: {
            userId,
          },
          status: {
            not:
              VerifyAccountStatus.PENDING ||
              VerifyAccountStatus.NEW ||
              VerifyAccountStatus.EXPIRED,
          },
        },
        select,
        orderBy: {
          createDate: 'asc',
        },
        distinct: ['brandId', 'driverId'],
      });

      return verifieds
        .map((verified) => verified[`${type}`])
        .map((verified) => {
          const user = verified?.user;
          delete verified?.user;
          return {
            ...verified,
            ...user,
          };
        })
        .filter((verified) => Object.keys(verified).length !== 0);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getHistoryDetailVerified(userId: string, id: string) {
    const select = {
      status: true,
      detail: true,
      createDate: true,
      updateAt: true,
    };
    try {
      return await this.prisma.verifyAccount.findMany({
        where: {
          AND: [
            {
              manager: {
                userId,
              },
            },
            {
              OR: [{ brandId: id }, { driverId: id }],
            },
            {
              status: {
                not:
                  VerifyAccountStatus.PENDING ||
                  VerifyAccountStatus.NEW ||
                  VerifyAccountStatus.EXPIRED,
              },
            },
          ],
        },
        select,
        orderBy: {
          createDate: 'desc',
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
