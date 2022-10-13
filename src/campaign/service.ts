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
            verifyCampaign: {
              every: {
                status: {
                  in: ['NEW', 'PENDING', 'UPDATE'],
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
              in: ['OPEN', 'PAYMENT', 'WARPPING', 'RUNNING'],
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
    const checkIdCampaign = await this.findCampaignByID(campaignId);
    if (!checkIdCampaign)
      throw new BadRequestException('Campaign ID invalid to update');

    const user = await this.getUserBrandVerifyCampaign(
      userReq.email,
      userReq.role,
      campaignId,
    );
    const campaignToUpdate = user.brand.campaign[0]?.verifyCampaign[0]?.status;
    if (campaignToUpdate !== 'UPDATE') {
      throw new BadRequestException(
        'Invalid to update your campaign, request verify campaign was handled or waiting for us to handle',
      );
    }

    try {
      if (campaignToUpdate === 'UPDATE') {
        await this.updateCampaignInformation(
          userReq.id,
          dto,
          campaignId,
          user.brand.campaign[0]?.verifyCampaign[0]?.id,
        );
      }
      return 'Updated';
    } catch (e) {
      throw new Error(e.message);
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
        totalKm: true,
        quantityDriver: true,
        minimumKmDrive: true,
        description: true,
        dateOpenRegister: true,
        startRegisterDate: true,
        endRegisterDate: true,
        dateWrapSticket: true,
        brand: {
          select: {
            brandName: true,
            logo: true,
          },
        },
        locationCampaign: {
          select: {
            locationName: true,
            price: true,
          },
        },
        wrap: {
          select: {
            imagePoster: true,
            positionWarp: true,
            price: true,
          },
        },
        verifyCampaign: {
          select: {
            status: true,
            detail: true,
            createDate: true,
            updateAt: true,
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
    const checkCampaignNameUsed = await this.checkCampaignNameUsed(
      dto.campaignName,
    );
    if (checkCampaignNameUsed)
      throw new BadRequestException('Campaign name already used!');
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
                  duration: dto.duration,
                  totalKm: dto.totalKm,
                  quantityDriver: dto.quantityDriver,
                  minimumKmDrive: dto.minimumKmDrive,
                  description: dto.description,
                  wrap: {
                    update: {
                      imagePoster: dto.imagePoster,
                      positionWarp: dto.positionWarp,
                    },
                  },
                  locationCampaign: {
                    update: {
                      locationName: dto.locationName,
                    },
                  },
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

  async findCampaignByID(campaignId: string) {
    return await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
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
      },
      orderBy: {
        startRunningDate: 'asc',
      },
    });
  }

  async createCampaign(dto: CampaignVerifyInformationDTO, userId: string) {
    const checkCampaignNameUsed = await this.checkCampaignNameUsed(
      dto.campaignName,
    );
    if (checkCampaignNameUsed)
      throw new BadRequestException('Campaign name already used!');
    const currentDate = new Date(dto.startRunningDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const campaign = await this.prisma.campaign.create({
      data: {
        campaignName: dto.campaignName,
        startRunningDate: currentDate.toISOString(),
        duration: dto.duration,
        quantityDriver: dto.quantityDriver,
        totalKm: dto.totalKm,
        description: dto.description,
        brand: {
          connect: {
            userId,
          },
        },
        locationCampaign: {
          create: {
            locationName: dto.locationName,
            price: '1,000,000',
          },
        },
        wrap: {
          create: {
            positionWarp: dto.positionWarp,
            imagePoster: dto.imagePoster,
            price: dto.positionWarp === 'ONE_SIDE' ? '500,000' : '1,000,000',
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
        locationCampaign: {
          select: {
            locationName: true,
          },
        },
        wrap: {
          select: {
            imagePoster: true,
            positionWarp: true,
          },
        },
        verifyCampaign: {
          select: {
            status: true,
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

  async checkCampaignNameUsed(campaignName: string) {
    return await this.prisma.campaign.findFirst({
      where: {
        campaignName,
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
}
