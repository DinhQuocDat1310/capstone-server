import { CreateOdoRequestDTO } from './../brand/dto';
import { PrismaService } from '../prisma/service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class VerifyOdoService {
  constructor(private readonly prisma: PrismaService) {}

  async requestVerifyOdo(userId: string, driverId: string) {
    const driverJoinCampaign = await this.prisma.driverJoinCampaign.findFirst({
      where: {
        driverId,
        status: 'APPROVE',
      },
    });
    if (!driverJoinCampaign)
      throw new BadRequestException(
        'Cannot send request checkOdo because, driverId is invalid with this campaign',
      );
    await this.prisma.verifyOdo.create({
      data: {
        brand: {
          connect: {
            userId,
          },
        },
        driverJoinCampaign: {
          connect: {
            id: driverJoinCampaign.id,
          },
        },
      },
    });
    return `Create success request check odo`;
  }

  async getListRequestOdoPending(userId: string) {
    return await this.prisma.verifyOdo.findMany({
      where: {
        driverJoinCampaign: {
          driver: {
            userId,
          },
        },
        status: 'PENDING',
      },
      select: {
        id: true,
        driverJoinCampaignId: true,
        createDate: true,
      },
      orderBy: {
        createDate: 'asc',
      },
    });
  }

  async createPhotoOdo(userId: string, dto: CreateOdoRequestDTO) {
    await this.prisma.verifyOdo.update({
      where: {
        id: dto.verifyOdoId,
      },
      data: {
        imageCarOdoBefore: dto.imageOdoBefore,
        imageCarOdoAfter: dto.imageOdoAfter,
        status: 'SUCCESS',
      },
    });
    return 'Taken photos odo request success';
  }

  async viewListResultOdoFromDriver(userId: string) {
    return await this.prisma.verifyOdo.findMany({
      where: {
        brand: {
          userId,
        },
      },
      include: {
        driverJoinCampaign: true,
      },
    });
  }
}
