import { PrismaService } from './../prisma/service';
import { Injectable } from '@nestjs/common';
import { VerifyAccountStatus } from '@prisma/client';

@Injectable()
export class ManagerService {
  constructor(private readonly prisma: PrismaService) {}

  async getManagers() {
    return await this.prisma.manager.findMany({
      select: {
        id: true,
      },
    });
  }

  async connectVerifyAccountsToManager(
    verifyIds: { id: string }[],
    managerId: string,
  ) {
    return await this.prisma.manager.update({
      where: {
        id: managerId,
      },
      data: {
        verify: {
          connect: verifyIds,
          updateMany: {
            where: {
              status: 'NEW',
            },
            data: {
              status: 'PENDING',
            },
          },
        },
      },
    });
  }

  async listManagerHandleTask(status: VerifyAccountStatus) {
    const list = await this.prisma.manager.findMany({
      select: {
        user: {
          select: {
            email: true,
          },
        },
        userId: true,
        _count: {
          select: {
            verify: {
              where: {
                status,
              },
            },
          },
        },
      },
    });
    const format = list.map((verify) => {
      return {
        userId: verify.userId,
        email: verify.user.email,
        count: verify._count.verify,
      };
    });
    return format;
  }

  async connectVerifyCampaignToManager(
    verifyIds: { id: string }[],
    managerId: string,
  ) {
    return await this.prisma.manager.update({
      where: {
        id: managerId,
      },
      data: {
        verifyCampaign: {
          connect: verifyIds,
          updateMany: {
            where: {
              status: 'NEW',
            },
            data: {
              status: 'PENDING',
            },
          },
        },
      },
    });
  }
}
