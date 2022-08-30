import { PrismaService } from './../prisma/service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ManagerService {
  constructor(private readonly prisma: PrismaService) {}
  async getManagerId() {
    return await this.prisma.manager.findMany({
      select: {
        id: true,
      },
    });
  }

  async mappingManagerId(listId: string[]) {
    const result = await this.prisma.manager.findMany({
      where: {
        verifyBrand: {
          none: {
            managerId: {
              in: listId,
            },
          },
        },
      },
    });
    return result;
  }

  async findAllManager() {
    return await this.prisma.manager.findMany();
  }
}
