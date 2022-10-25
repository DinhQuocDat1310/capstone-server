import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserSignIn } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/service';
import { CampaignVerifyInformationDTO } from './dto';
import { Role } from '@prisma/client';

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  async getListVerifiesCampaignByUserId(userId: string) {
    return await this.prisma.campaign.findMany({
      where: {
        AND: [
          {
            statusCampaign: {
              notIn: [
                'CANCELED',
                'CLOSED',
                'OPEN',
                'PAYMENT',
                'RUNNING',
                'WRAPPING',
              ],
            },
          },
          {
            verifyCampaign: {
              every: {
                status: {
                  in: ['NEW', 'PENDING', 'UPDATE', 'ACCEPT'],
                },
              },
            },
          },
          {
            brand: {
              userId,
            },
          },
        ],
      },
      select: {
        id: true,
        campaignName: true,
        quantityDriver: true,
        startRunningDate: true,
        brand: {
          select: {
            brandName: true,
            logo: true,
          },
        },
        locationCampaign: {
          select: {
            locationName: true,
          },
        },
        verifyCampaign: {
          select: {
            status: true,
            detail: true,
          },
          orderBy: {
            createDate: 'desc',
          },
        },
      },
      orderBy: {
        startRunningDate: 'asc',
      },
    });
  }

  async getListCurrentCampaignByUserId(userId: string) {
    return await this.prisma.campaign.findMany({
      where: {
        AND: [
          {
            statusCampaign: {
              in: ['OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING'],
            },
          },
          {
            verifyCampaign: {
              every: {
                status: {
                  notIn: ['NEW', 'PENDING', 'UPDATE', 'BANNED'],
                },
              },
            },
          },
          {
            brand: {
              userId,
            },
          },
        ],
      },
      select: {
        id: true,
        campaignName: true,
        quantityDriver: true,
        startRunningDate: true,
        brand: {
          select: {
            brandName: true,
            logo: true,
          },
        },
        locationCampaign: {
          select: {
            locationName: true,
          },
        },
        statusCampaign: true,
      },
      orderBy: {
        startRunningDate: 'asc',
      },
    });
  }

  async updateCampaign(
    dto: CampaignVerifyInformationDTO,
    userReq: UserSignIn,
    campaignId: string,
  ) {
    const checkCampaignNameUser = await this.checkCampaignNameUsed(
      dto.campaignName,
      userReq.id,
    );
    const findCampaignOwn = await this.findCampaignOwn(campaignId, userReq.id);
    if (checkCampaignNameUser) {
      throw new BadRequestException('Campaign name already used');
    }
    if (findCampaignOwn.campaignName !== dto.campaignName) {
      const checkUniqueCampaignNameOwn = await this.findCampaignNameOwn(
        userReq.id,
        dto.campaignName,
      );
      if (checkUniqueCampaignNameOwn) {
        throw new BadRequestException('Campaign name already used');
      } else {
        const user = await this.getUserBrandVerifyCampaign(
          userReq.email,
          userReq.role,
          campaignId,
        );
        const campaignToUpdate =
          user.brand.campaign[0]?.verifyCampaign[0]?.status;
        if (campaignToUpdate !== 'UPDATE') {
          throw new BadRequestException(
            'Invalid to update your campaign, request verify campaign was handled or waiting for us to handle',
          );
        }
        if (campaignToUpdate === 'UPDATE') {
          await this.updateCampaignInformation(
            userReq.id,
            dto,
            campaignId,
            user.brand.campaign[0]?.verifyCampaign[0]?.id,
          );
        }
        return 'Updated';
      }
    } else {
      const user = await this.getUserBrandVerifyCampaign(
        userReq.email,
        userReq.role,
        campaignId,
      );
      const campaignToUpdate =
        user.brand.campaign[0]?.verifyCampaign[0]?.status;
      if (campaignToUpdate !== 'UPDATE') {
        throw new BadRequestException(
          'Invalid to update your campaign, request verify campaign was handled or waiting for us to handle',
        );
      }
      if (campaignToUpdate === 'UPDATE') {
        await this.updateCampaignInformation(
          userReq.id,
          dto,
          campaignId,
          user.brand.campaign[0]?.verifyCampaign[0]?.id,
        );
      }
      return 'Updated';
    }
  }

  async viewCampaignDetails(userId: string, campaignId: string) {
    const brandOwnCampaign = await this.prisma.campaign.findFirst({
      where: {
        AND: [
          {
            id: campaignId,
          },
          {
            OR: [
              {
                brand: {
                  userId,
                },
              },
              {
                verifyCampaign: {
                  some: {
                    manager: {
                      userId,
                    },
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        campaignName: true,
        startRegisterDate: true,
        endRegisterDate: true,
        startRunningDate: true,
        detailMessage: true,
        poster: true,
        duration: true,
        totalKm: true,
        quantityDriver: true,
        minimumKmDrive: true,
        description: true,
        startWrapDate: true,
        endWrapDate: true,
        wrapPrice: true,
        statusCampaign: true,
        verifyCampaign: {
          select: {
            id: true,
            status: true,
            detail: true,
            createDate: true,
            updateAt: true,
          },
        },
        brand: {
          select: {
            id: true,
            brandName: true,
            logo: true,
          },
        },
        wrap: {
          select: {
            positionWrap: true,
            price: true,
          },
        },
        locationCampaign: {
          select: {
            locationName: true,
            price: true,
          },
        },
        contractCampaign: {
          select: {
            id: true,
            contractName: true,
            totalDriverMoney: true,
            totalSystemMoney: true,
            totalWrapMoney: true,
          },
        },
        paymentDebit: {
          select: {
            id: true,
            createDate: true,
            expiredDate: true,
            paidDate: true,
            type: true,
            price: true,
          },
        },
      },
    });
    if (!brandOwnCampaign) {
      throw new BadRequestException('Campaign ID not found');
    }
    return brandOwnCampaign;
  }

  async updateCampaignInformation(
    id: string,
    dto: CampaignVerifyInformationDTO,
    campaignId: string,
    verifyCampaignId: string,
  ) {
    const dataLocation = await this.prisma.locationCampaignPerKm.findFirst({
      where: {
        id: dto.idLocation,
      },
    });
    const dataWrap = await this.prisma.wrap.findFirst({
      where: {
        id: dto.idWrap,
      },
    });
    const currentDate = new Date(dto.startRunningDate);
    currentDate.setDate(currentDate.getDate() + 1);
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        brand: {
          update: {
            campaign: {
              update: {
                where: {
                  id: campaignId,
                },
                data: {
                  campaignName: dto.campaignName,
                  startRunningDate: currentDate.toISOString(),
                  totalKm: dto.totalKm,
                  quantityDriver: dto.quantityDriver,
                  minimumKmDrive: dto.minimumKmDrive,
                  description: dto.description,
                  poster: dto.poster,
                  wrapPrice: dataWrap.price,
                  locationPricePerKm: dataLocation.price,
                  verifyCampaign: {
                    update: {
                      where: {
                        id: verifyCampaignId,
                      },
                      data: {
                        detail: null,
                        status: 'PENDING',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findCampaignNameOwn(userId: string, campaignName: string) {
    return await this.prisma.campaign.findFirst({
      where: {
        AND: [
          {
            campaignName,
          },
          {
            brand: {
              userId,
            },
          },
        ],
      },
      select: {
        campaignName: true,
      },
    });
  }

  async getUserBrandVerifyCampaign(
    email: string,
    role: Role,
    campaignId: string,
  ) {
    const brand = await this.prisma.campaign.findFirst({
      where: {
        AND: [
          { id: campaignId },
          {
            brand: {
              user: {
                email,
                role,
              },
            },
          },
        ],
      },
      select: {
        brand: {
          select: {
            campaign: {
              where: {
                id: campaignId,
              },
              select: {
                verifyCampaign: {
                  where: {
                    AND: [{ campaignId: campaignId }, { status: 'UPDATE' }],
                  },
                },
              },
            },
          },
        },
      },
    });
    return brand;
  }

  async getListHistoryCampaignByUserId(userId: string) {
    return await this.prisma.campaign.findMany({
      where: {
        AND: [
          {
            statusCampaign: {
              in: ['CANCELED', 'CLOSED'],
            },
          },
          {
            verifyCampaign: {
              every: {
                status: {
                  in: ['BANNED', 'ACCEPT'],
                },
              },
            },
          },
          {
            brand: {
              userId,
            },
          },
        ],
      },
      select: {
        id: true,
        campaignName: true,
        startRunningDate: true,
        duration: true,
        quantityDriver: true,
        statusCampaign: true,
        brand: {
          select: {
            brandName: true,
            logo: true,
          },
        },
      },
      orderBy: {
        startRunningDate: 'asc',
      },
    });
  }

  async createCampaign(dto: CampaignVerifyInformationDTO, userId: string) {
    const isCampaignNameExist = await this.prisma.campaign.findFirst({
      where: {
        campaignName: dto.campaignName,
        brand: {
          userId,
        },
      },
    });
    if (isCampaignNameExist)
      throw new BadRequestException('Campaign name already used!');
    const currentDate = new Date(dto.startRunningDate);
    currentDate.setDate(currentDate.getDate() + 1);
    // const dataLocation = await this.prisma.locationCampaignPerKm.findFirst({
    //   where: {
    //     id: dto.idLocation,
    //   },
    // });
    // const dataWrap = await this.prisma.wrap.findFirst({
    //   where: {
    //     id: dto.idWrap,
    //   },
    // });
    const campaign = await this.prisma.campaign.create({
      data: {
        campaignName: dto.campaignName,
        startRunningDate: currentDate.toISOString(),
        quantityDriver: dto.quantityDriver,
        totalKm: dto.totalKm,
        description: dto.description,
        poster: dto.poster,
        minimumKmDrive: dto.minimumKmDrive,
        locationPricePerKm: dto.priceLocation,
        wrapPrice: dto.priceWrap,
        duration: dto.duration,
        brand: {
          connect: {
            userId,
          },
        },
        locationCampaign: {
          connect: {
            id: dto.idLocation,
          },
        },
        wrap: {
          connect: {
            id: dto.idWrap,
          },
        },
      },
      select: {
        id: true,
        campaignName: true,
        duration: true,
        totalKm: true,
        description: true,
        quantityDriver: true,
        minimumKmDrive: true,
        startRunningDate: true,
        poster: true,
        locationCampaign: {
          select: {
            id: true,
            locationName: true,
            price: true,
          },
        },
        wrap: {
          select: {
            id: true,
            positionWrap: true,
            price: true,
          },
        },
      },
    });
    await this.prisma.verifyCampaign.create({
      data: {
        campaign: {
          connect: {
            id: campaign.id,
          },
        },
      },
    });
    return campaign;
  }

  async checkCampaignNameUsed(campaignName: string, userId: string) {
    return await this.prisma.campaign.findFirst({
      where: {
        AND: [
          { campaignName },
          {
            brand: {
              userId: {
                not: userId,
              },
            },
          },
        ],
      },
      select: {
        campaignName: true,
      },
    });
  }

  async findCampaignOwn(campaignId: string, userId: string) {
    return await this.prisma.campaign.findFirst({
      where: {
        AND: [
          { id: campaignId },
          {
            brand: {
              userId,
            },
          },
        ],
      },
      select: {
        campaignName: true,
      },
    });
  }

  async cancelCampaign(userId: string, campaignId: string) {
    const checkCampaignId = await this.prisma.campaign.findFirst({
      where: {
        AND: [
          {
            brand: {
              userId,
            },
          },
          {
            id: campaignId,
          },
        ],
      },
    });
    if (!checkCampaignId)
      throw new BadRequestException('Not found campaign Id for Cancel');
    const checkStatusCampaign = await this.prisma.campaign.findFirst({
      where: {
        AND: [
          { id: campaignId },
          { statusCampaign: 'NEW' },
          {
            verifyCampaign: {
              some: {
                status: 'NEW',
              },
            },
          },
        ],
      },
      select: {
        verifyCampaign: {
          select: {
            id: true,
            campaignId: true,
          },
        },
      },
    });
    if (!checkStatusCampaign)
      throw new BadRequestException(
        'This Campaign is being process handling, can not Cancel',
      );
    try {
      await this.prisma.campaign.update({
        where: {
          id: campaignId,
        },
        data: {
          statusCampaign: 'CANCELED',
          verifyCampaign: {
            delete: {
              id: checkStatusCampaign.verifyCampaign[0]?.id,
            },
          },
        },
      });
      return 'Success Cancel campaign';
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getAmountDriverJoinCampaign(userId: string, campaignId: string) {
    const isOwnCampaign = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
        brand: {
          userId,
        },
      },
    });
    if (!isOwnCampaign)
      throw new BadRequestException('You are not the owner this campaign!');

    const count = await this.prisma.driverJoinCampaign.count({
      where: {
        campaignId,
      },
    });
    return count;
  }
}
