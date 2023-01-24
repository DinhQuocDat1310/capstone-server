import {
  FAKE_LOGO,
  FAKE_LICENSE,
  FAKE_BACK_CARDLICENSE,
  FAKE_FRONT_CARDLICENSE,
  FAKE_TYPE_BUSINESS,
  FAKE_OWNER_BUSINESS,
  FAKE_IMAGE_CAR,
  FAKE_ADDRESS_ACCOUNT,
} from './../constants/fake-data';
import { PrismaService } from './../prisma/service';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ManagerVerifyDTO } from 'src/manager/dto';
import { StatusUser, StatusVerifyAccount } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { AppConfigService } from 'src/config/appConfigService';
import { Cache } from 'cache-manager';
import { GLOBAL_DATE } from 'src/constants/cache-code';

@Injectable()
export class VerifyAccountsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly configService: AppConfigService,
  ) {}

  async createNewRequestVerifyBrandAccount(id: string) {
    const globalDate: Date = await this.cacheManager.get(GLOBAL_DATE);
    try {
      return await this.prisma.verifyAccount.create({
        data: {
          createDate: globalDate,
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
        driverId: id,
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
          status: StatusVerifyAccount.PENDING,
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
          status: StatusVerifyAccount.PENDING,
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
    const globalDate: Date = await this.cacheManager.get(GLOBAL_DATE);
    try {
      return await this.prisma.verifyAccount.create({
        data: {
          createDate: globalDate,
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
          licensePlates: true,
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
          status: StatusVerifyAccount.PENDING,
        },
        select,
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
        .filter((verify) => Object.keys(verify[`${type}`]).length !== 0)
        .sort((v1, v2) => {
          if (v1.createDate > v2.createDate) {
            return 1;
          } else if (v1.createDate < v2.createDate) {
            return -1;
          }
          return 0;
        });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async managerVerifyAccount(userId: string, dto: ManagerVerifyDTO) {
    const verify = await this.prisma.verifyAccount.findFirst({
      where: {
        id: dto.verifyId,
        status: StatusVerifyAccount.PENDING,
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
    let status: StatusUser = 'PENDING';
    let message = '';
    switch (dto.action) {
      case 'ACCEPT':
        message = `<p>Congratulations!. Your ${type} information has been accepted</p>
           <p>Please login at the website for more details</p>`;
        status = StatusUser.VERIFIED;
        break;
      case 'BANNED':
        message = `<p>Your account has been banned for violating our terms</p>
           <p>Please contact ${this.configService.getConfig(
             'MAILER',
           )} for more information</p>`;
        status = StatusUser.BANNED;
        break;
      case 'UPDATE':
        message = `<p>The ${type} information you provided is not valid, please update so that Brandvertise's team can support as soon as possible.</p>
           <p>Please login at the website for more details</p>`;
        status = StatusUser.UPDATE;
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
    const globalDate: Date = await this.cacheManager.get(GLOBAL_DATE);
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
              address: FAKE_ADDRESS_ACCOUNT[random],
            },
          },
        },
      });
      await this.prisma.verifyAccount.create({
        data: {
          createDate: globalDate,
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
      const randomlicensePlates = Math.floor(
        Math.random() * (Math.pow(10, 5) * 9.9 - Math.pow(10, 5) + 1) +
          Math.pow(10, 5),
      );

      const randomAccountNumber = Math.floor(
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
          licensePlates: `51F-${randomlicensePlates}`,
          user: {
            update: {
              status: 'PENDING',
              fullname: FAKE_OWNER_BUSINESS[random],
              imageCitizenFront: FAKE_FRONT_CARDLICENSE[random],
              imageCitizenBack: FAKE_BACK_CARDLICENSE[random],
              idCitizen: randomIdCitizend.toString(),
              address: FAKE_ADDRESS_ACCOUNT[random],
              email: `driver${i}@gmail.com`,
            },
          },
        },
      });
      await this.prisma.verifyAccount.create({
        data: {
          createDate: globalDate,
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
            not: StatusVerifyAccount.PENDING || StatusVerifyAccount.NEW,
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
                not: StatusVerifyAccount.PENDING || StatusVerifyAccount.NEW,
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

  async getAllVerifyPending(userId: string) {
    const ids = await this.prisma.verifyAccount.findMany({
      where: {
        manager: {
          userId,
        },
        status: StatusVerifyAccount.PENDING,
      },
      select: {
        id: true,
      },
    });
    return ids.map((verify) => verify['id']);
  }

  async getAllBrandVerifyByManagerId(userId: string) {
    try {
      const brands = await this.prisma.verifyAccount.findMany({
        where: {
          manager: {
            userId,
          },
          status: StatusVerifyAccount.PENDING,
        },
        include: {
          brand: {
            select: {
              userId: true,
            },
          },
        },
      });
      return brands
        .map((brand) => brand['brand']?.userId)
        .filter((brand) => Object.keys(brand || {}).length !== 0);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getAllDriverVerifyByManagerId(userId: string) {
    try {
      const drivers = await this.prisma.verifyAccount.findMany({
        where: {
          manager: {
            userId,
          },
          status: StatusVerifyAccount.PENDING,
        },
        include: {
          driver: {
            select: {
              userId: true,
            },
          },
        },
      });
      return drivers
        .map((driver) => driver['driver']?.userId)
        .filter((driver) => Object.keys(driver || {}).length !== 0);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async fakeAutoVerifyAccountRequest(userId: string) {
    const verifies = await this.getAllVerifyPending(userId);
    const brands = await this.getAllBrandVerifyByManagerId(userId);
    const drivers = await this.getAllDriverVerifyByManagerId(userId);
    if (brands.length === 0 && drivers.length === 0)
      throw new NotFoundException(
        `Not found any verify request of Brand/Driver is pending to Accept`,
      );
    try {
      await this.prisma.verifyAccount.updateMany({
        where: {
          id: {
            in: verifies,
          },
        },
        data: {
          status: StatusVerifyAccount.ACCEPT,
        },
      });
      await this.prisma.user.updateMany({
        where: {
          id: {
            in: [...brands, ...drivers],
          },
        },
        data: {
          status: StatusUser.VERIFIED,
        },
      });
      return `ACCEPT ${
        brands.length + drivers.length
      } request verify account. ${
        brands.length + drivers.length
      } account VERIFIED.`;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkManagerContraistTask(managerId: string) {
    const taskAccounts = await this.prisma.verifyAccount.findMany({
      where: {
        AND: [
          { managerId },
          {
            status: {
              in: ['PENDING', 'UPDATE'],
            },
          },
        ],
      },
      select: {
        id: true,
        status: true,
      },
    });
    const resultStatus = taskAccounts.filter(
      (task) => task.status === 'UPDATE',
    );
    if (resultStatus.length !== 0) {
      throw new BadRequestException(
        `This Manager has ${resultStatus.length} task Account processing: UPDATE. Please wait manager end task for Disable.`,
      );
    }
    return taskAccounts.map((verify) => verify['id']);
  }

  async removeTaskAccountOutOfManager(ids: string[]) {
    await this.prisma.verifyAccount.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status: StatusVerifyAccount.NEW,
        managerId: null,
      },
    });
  }

  async getTaskAccount(managerId: string) {
    const taskAccount = await this.prisma.verifyAccount.findMany({
      where: {
        managerId,
      },
      select: {
        brand: {
          select: {
            brandName: true,
          },
        },
        driver: {
          select: {
            user: {
              select: {
                fullname: true,
              },
            },
          },
        },
        status: true,
        detail: true,
        createDate: true,
      },
      orderBy: {
        createDate: 'asc',
      },
    });
    const mapBrand = taskAccount
      .map((task) => task)
      .map((task) => {
        const time = task?.createDate;
        const name = task?.brand?.brandName;
        if (task?.brand) {
          delete task?.brand;
          delete task?.driver;
          delete task?.createDate;
          return {
            action: 'Verify Brand',
            name,
            ...task,
            time,
          };
        }
      })
      .filter((task) => Object.keys(task || {}).length !== 0);

    const mapDriver = taskAccount
      .map((task) => task)
      .map((task) => {
        const time = task?.createDate;
        const name = task?.driver?.user?.fullname;
        if (task?.driver) {
          delete task?.driver;
          delete task?.brand;
          delete task?.createDate;
          return {
            action: 'Verify Driver',
            name,
            ...task,
            time,
          };
        }
      })
      .filter((task) => Object.keys(task || {}).length !== 0);
    return [...mapBrand, ...mapDriver];
  }

  async getAllTaskAccountNew() {
    const taskAccount = await this.prisma.verifyAccount.findMany({
      where: {
        status: 'NEW',
      },
      select: {
        id: true,
        brand: {
          select: { brandName: true },
        },
        driver: {
          select: {
            user: {
              select: {
                fullname: true,
              },
            },
          },
        },
      },
      orderBy: {
        createDate: 'asc',
      },
    });
    const mapBrand = taskAccount
      .map((task) => task)
      .map((task) => {
        const name = task?.brand?.brandName;
        if (task?.brand) {
          delete task?.brand;
          delete task?.driver;
          return {
            action: 'Verify Brand',
            name,
            ...task,
          };
        }
      })
      .filter((task) => Object.keys(task || {}).length !== 0);

    const mapDriver = taskAccount
      .map((task) => task)
      .map((task) => {
        const name = task?.driver?.user?.fullname;
        if (task?.driver) {
          delete task?.driver;
          delete task?.brand;
          return {
            action: 'Verify Driver',
            name,
            ...task,
          };
        }
      })
      .filter((task) => Object.keys(task || {}).length !== 0);
    return [...mapBrand, ...mapDriver];
  }
}
