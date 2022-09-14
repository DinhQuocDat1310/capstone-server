import { PrismaService } from './../prisma/service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ManagerVerifyDTO } from 'src/manager/dto';
import { Prisma, UserStatus, VerifyAccountStatus } from '@prisma/client';
import * as moment from 'moment';
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

  async getListVerifyBrandByUserId(userId: string) {
    return await this.prisma.verifyAccount.findMany({
      where: {
        brand: {
          userId,
        },
      },
      orderBy: {
        createDate: 'desc',
      },
    });
  }

  async getListVerifyPendingByManagerId(userId: string, type: string) {
    if (['driver', 'brand', 'all'].indexOf(type.toLowerCase()) === -1)
      throw new BadRequestException('The role is not valid!. please try again');

    const select = {
      id: true,
      status: true,
      detail: true,
      createDate: true,
      expiredDate: true,
      assignBy: true,
    };
    if (type === 'brand' || type === 'all') {
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
    if (type === 'driver' || type === 'all') {
      select['driver'] = true;
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
      return verifies.map((verify) => {
        if (type === 'brand' || type === 'all') {
          const user = verify['brand']?.user;
          delete verify['brand']?.user;
          verify['brand'] = {
            ...verify['brand'],
            ...user,
          };
        }
        return verify;
      });
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
    const type = verify.brand ? 'brand' : 'driver';
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
        email: true,
        status: true,
        brand: {
          select: {
            brandName: true,
          },
        },
      },
    });
    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.getConfig('MAILER'),
      subject: 'Result verification account',
      html: `
       <p>Dear ${user.brand.brandName},</p></br>
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

  async getAllVerifyExpired(): Promise<Prisma.VerifyAccountCreateInput[]> {
    const verify = await this.prisma.verifyAccount.findMany({
      where: {
        expiredDate: {
          lt: moment().toDate(),
        },
        status: 'PENDING',
      },
    });
    return verify;
  }

  async updateVerifyAccountExpired() {
    await this.prisma.verifyAccount.updateMany({
      where: {
        expiredDate: {
          lt: moment().toDate(),
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });
  }

  async createNewVerifyWhenExpired(
    verifies: Prisma.VerifyAccountCreateInput[],
  ) {
    const data = verifies.map((verify) => {
      return {
        expiredDate: verify.expiredDate,
      };
    });
    await this.prisma.verifyAccount.createMany({
      data,
    });
  }

  async fakeAutoCreateVerifyRequest() {
    const brands = await this.prisma.brand.findMany({
      where: {
        user: {
          status: 'NEW',
        },
      },
      include: { verify: true },
    });

    const brandsFilter = brands.filter(
      (brand) =>
        !brand.verify.some((b) => b.status === 'NEW' || b.status === 'PENDING'),
    );

    if (brandsFilter.length === 0) {
      return 'all Brand is on processing!';
    }

    for (let i = 0; i < brandsFilter.length; i++) {
      await this.prisma.brand.update({
        where: {
          id: brands[i].id,
        },
        data: {
          user: {
            update: {
              status: 'PENDING',
            },
          },
        },
      });
      await this.prisma.verifyAccount.create({
        data: {
          brand: {
            connect: {
              id: brands[i].id,
            },
          },
        },
      });
    }
    return `Create ${brandsFilter.length} request verify NEW Brand`;
  }
}
