import { PrismaService } from './../prisma/service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserSignIn } from 'src/auth/dto';
import { ManagerVerifyDTO } from 'src/manager/dto';
import { Prisma, UserStatus, VerifyAccountStatus } from '@prisma/client';
import * as moment from 'moment';

@Injectable()
export class VerifyAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewRequestVerifyBrandAccount(userReq: UserSignIn) {
    return await this.prisma.verifyAccount.create({
      data: {
        brand: {
          connect: {
            userId: userReq.id,
          },
        },
      },
    });
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
    const verifyList = await this.prisma.verifyAccount.findMany({
      where: {
        brand: {
          userId,
        },
      },
      include: {
        brand: true,
      },
      orderBy: {
        createDate: 'desc',
      },
    });
    const current = verifyList[0];
    const history = verifyList.slice(1).map((verify) => {
      delete verify.brand;
      return verify;
    });
    return {
      current,
      history,
    };
  }

  async getListVerifyPendingByManagerId(userId: string, type: string) {
    if (!type) throw new BadRequestException('Please input role!');
    const include = {
      brand: false,
      driver: false,
    };
    if (type === 'all') {
      include.brand = true;
      include.driver = true;
    }
    if (type === 'driver' || type === 'brand') {
      include[type] = true;
    }
    return await this.prisma.verifyAccount.findMany({
      where: {
        manager: {
          userId,
        },
        status: VerifyAccountStatus.PENDING,
      },
      include,
      orderBy: {
        createDate: 'asc',
      },
    });
  }

  async verifyAccount(managerId: string, dto: ManagerVerifyDTO) {
    const verify = await this.prisma.verifyAccount.findFirst({
      where: {
        id: dto.verifyId,
        status: VerifyAccountStatus.PENDING,
        managerId,
      },
      include: {
        brand: {
          select: {
            userId: true,
          },
        },
      },
    });
    if (!verify) {
      throw new BadRequestException();
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
    switch (dto.action) {
      case 'ACCEPT':
        status = UserStatus.VERIFIED;
        break;
      case 'BANNED':
        status = UserStatus.BANNED;
        break;
      case 'UPDATE':
        status = UserStatus.UPDATE;
        break;
    }
    await this.prisma.user.update({
      where: {
        id: verify.brand.userId,
      },
      data: {
        status,
      },
    });
    return 'success';
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
      include: { verify: true },
    });
    const managers = await this.prisma.manager.findMany({});

    const brandsFilter = brands.filter(
      (brand) =>
        !brand.verify.some((b) => b.status === 'NEW' || b.status === 'PENDING'),
    );

    const ratio = Math.floor(brandsFilter.length - 1) / (managers.length - 1);
    for (let i = 0; i < brands.length; i++) {
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
          expiredDate: moment().add(1, 'days').toDate(),
          brand: {
            connect: {
              id: brands[i].id,
            },
          },
          manager: {
            connect: {
              id: managers[Math.floor(i / ratio)].id,
            },
          },
        },
      });
    }
    return 'success';
  }
}
