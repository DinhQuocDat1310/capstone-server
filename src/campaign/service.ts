import { VerifyCampaignService } from './../verifyCampaign/service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserSignIn } from 'src/auth/dto';
import { AppConfigService } from 'src/config/appConfigService';
import { PrismaService } from 'src/prisma/service';
import { UsersService } from 'src/user/service';
import { CampaignVerifyInformationDTO } from './dto';
import { Role } from '@prisma/client';

@Injectable()
export class CampaignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly verifyCampaignService: VerifyCampaignService,
    private readonly configService: AppConfigService,
  ) {}

  async getListCampaignByUserId(userId: string) {
    return await this.prisma.campaign.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                statusCampaign: {
                  in: ['NEW', 'OPENING'],
                },
              },
              {
                verifyCampaign: {
                  every: {
                    status: {
                      in: ['PENDING', 'UPDATE'],
                    },
                  },
                },
              },
            ],
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
        duration: true,
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
        statusCampaign: true,
        verifyCampaign: {
          select: {
            status: true,
            detail: true,
            createDate: true,
            updateAt: true,
          },
        },
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
    const checkIdCampaign = await this.findIdCampaign(campaignId);
    if (!checkIdCampaign)
      throw new BadRequestException('Campaign ID invalid to update');

    const user = await this.getUserBrandVerifyCampaign(
      userReq.email,
      userReq.role,
      campaignId,
    );

    const latestVerifyCampaignStatus =
      user.brand.campaign[0]?.verifyCampaign[0]?.status;
    console.log(user.brand.campaign[0]?.verifyCampaign[0]);
    if (
      latestVerifyCampaignStatus === 'NEW' ||
      latestVerifyCampaignStatus === 'PENDING'
    ) {
      throw new BadRequestException(
        'Your campaign is on processing, we will response back in 1 to 3 working days',
      );
    }
    if (
      latestVerifyCampaignStatus === 'ACCEPT' ||
      latestVerifyCampaignStatus === 'BANNED'
    ) {
      throw new BadRequestException(
        `Your campaign is already processed, please check your email or contact with ${this.configService.getConfig(
          'MAILER',
        )} for more information`,
      );
    }

    try {
      if (!latestVerifyCampaignStatus) {
        await this.verifyCampaignService.createNewRequestVerifyCampaign(
          campaignId,
        );
      } else if (latestVerifyCampaignStatus === 'UPDATE') {
        await this.verifyCampaignService.createPendingRequestVerifyCampaign(
          campaignId,
          user.brand.campaign[0]?.verifyCampaign[0]?.managerId,
        );
      }
      await this.updateCampaignInformation(userReq.id, dto, campaignId);
      return 'Updated';
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async updateCampaignInformation(
    id: string,
    dto: CampaignVerifyInformationDTO,
    campaignId: string,
  ) {
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
                  startRunningDate: dto.startRunningDate,
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
                      locationName: dto.campaignName,
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

  async findIdCampaign(id: string) {
    return await this.prisma.campaign.findFirst({
      where: {
        AND: [
          { id },
          {
            verifyCampaign: {
              every: {
                status: {
                  in: 'UPDATE',
                },
              },
            },
          },
        ],
      },
    });
  }

  async getUserBrandVerifyCampaign(
    email: string,
    role: Role,
    campaignId: string,
  ) {
    console.log(campaignId);
    const brand = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
        brand: {
          user: {
            email,
            role,
          },
        },
      },
      select: {
        brand: {
          select: {
            campaign: {
              select: {
                verifyCampaign: {
                  orderBy: {
                    createDate: 'desc',
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
            OR: [
              {
                statusCampaign: {
                  in: ['CANCELED', 'CLOSED'],
                },
              },
              {
                verifyCampaign: {
                  every: {
                    status: {
                      in: ['BANNED'],
                    },
                  },
                },
              },
            ],
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
        statusCampaign: true,
        verifyCampaign: {
          select: {
            status: true,
            detail: true,
            createDate: true,
            updateAt: true,
          },
        },
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
    const campaign = await this.prisma.campaign.create({
      data: {
        campaignName: dto.campaignName,
        startRunningDate: dto.startRunningDate,
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
        statusCampaign: true,
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
    return { campaign, step: 1 };
  }

  async checkCampaignNameUsed(campaignName: string) {
    return await this.prisma.campaign.findFirst({
      where: {
        campaignName,
      },
    });
  }
}
