import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserSignIn } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/service';
import { CampaignVerifyInformationDTO, StepsCampaignDTO } from './dto';
import { StatusCampaign, Role } from '@prisma/client';
import { GLOBAL_DATE, OPTIONS_DATE } from 'src/constants/cache-code';
import { Cache } from 'cache-manager';
import { addDays, diffDates } from 'src/utilities';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

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
        route: {
          include: {
            checkpointTime: {
              select: {
                deadline: true,
                checkpoint: {
                  select: {
                    addressName: true,
                  },
                },
              },
            },
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
    const campaigns = await this.prisma.campaign.findMany({
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
        statusCampaign: true,
        route: {
          include: {
            coordinates: true,
            checkpointTime: true,
          },
        },
      },
      orderBy: {
        startRunningDate: 'asc',
      },
    });
    return campaigns.map((c) => {
      return {
        ...c,
        startRunningDate: new Date(c.startRunningDate).toLocaleDateString(
          'vn-VN',
          OPTIONS_DATE,
        ),
      };
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
    const globalDate: Date = new Date(await this.cacheManager.get(GLOBAL_DATE));

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
        startPaymentDate: true,
        endPaymentDate: true,
        startRunningDate: true,
        detailMessage: true,
        poster: true,
        duration: true,
        quantityDriver: true,
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
        route: {
          include: {
            checkpointTime: {
              select: {
                deadline: true,
                checkpoint: {
                  select: {
                    addressName: true,
                  },
                },
              },
            },
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
      },
    });
    if (!brandOwnCampaign) {
      throw new BadRequestException('Campaign ID not found');
    }
    let isWaiting = false;
    let days = 0;
    let messageWaiting = '';

    switch (brandOwnCampaign.statusCampaign) {
      case 'OPEN':
        isWaiting = globalDate < brandOwnCampaign.startRegisterDate;
        days = diffDates(globalDate, brandOwnCampaign.startRegisterDate);
        break;
      case 'PAYMENT':
        isWaiting = globalDate < brandOwnCampaign.startPaymentDate;
        days = diffDates(globalDate, brandOwnCampaign.startPaymentDate);
        break;
      case 'WRAPPING':
        isWaiting = globalDate < brandOwnCampaign.startWrapDate;
        days = diffDates(globalDate, brandOwnCampaign.startWrapDate);
        break;
      case 'RUNNING':
        isWaiting = globalDate < brandOwnCampaign.startRunningDate;
        days = diffDates(globalDate, brandOwnCampaign.startRunningDate);
        break;
    }
    if (isWaiting) {
      messageWaiting = `Our system is processing, please wait ${Math.abs(
        days,
      )} days to ${brandOwnCampaign.statusCampaign}`;
    }
    const brandDataFormat = {
      ...brandOwnCampaign,
      startPaymentDate: new Date(
        brandOwnCampaign.startPaymentDate,
      ).toLocaleDateString('vn-VN', OPTIONS_DATE),
      startRegisterDate: new Date(
        brandOwnCampaign.startRegisterDate,
      ).toLocaleDateString('vn-VN', OPTIONS_DATE),
      startRunningDate: new Date(
        brandOwnCampaign.startRunningDate,
      ).toLocaleDateString('vn-VN', OPTIONS_DATE),
      startWrapDate: new Date(
        brandOwnCampaign.startWrapDate,
      ).toLocaleDateString('vn-VN', OPTIONS_DATE),
      endPaymentDate: new Date(
        brandOwnCampaign.endPaymentDate,
      ).toLocaleDateString('vn-VN', OPTIONS_DATE),
      endRegisterDate: new Date(
        brandOwnCampaign.endRegisterDate,
      ).toLocaleDateString('vn-VN', OPTIONS_DATE),
      endWrapDate: new Date(brandOwnCampaign.endWrapDate).toLocaleDateString(
        'vn-VN',
        OPTIONS_DATE,
      ),
    };
    return { ...brandDataFormat, isWaiting: `${isWaiting}`, messageWaiting };
  }

  async updateCampaignInformation(
    id: string,
    dto: CampaignVerifyInformationDTO,
    campaignId: string,
    verifyCampaignId: string,
  ) {
    const dataWrap = await this.prisma.wrap.findFirst({
      where: {
        id: dto.idWrap,
      },
    });
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
                  startRunningDate: new Date(dto.startRunningDate),
                  quantityDriver: +dto.quantityDriver,
                  description: dto.description,
                  poster: dto.poster,
                  wrapPrice: dataWrap.price,
                  route: {
                    connect: {
                      id: dto.routeId,
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
    const globalDate: Date = await this.cacheManager.get(GLOBAL_DATE);

    const campaign = await this.prisma.campaign.create({
      data: {
        campaignName: dto.campaignName,
        startRunningDate: new Date(dto.startRunningDate),
        quantityDriver: +dto.quantityDriver,
        description: dto.description,
        poster: dto.poster,
        wrapPrice: +dto.priceWrap,
        duration: +dto.duration,
        brand: {
          connect: {
            userId,
          },
        },
        route: {
          connect: {
            id: dto.routeId,
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
        description: true,
        quantityDriver: true,
        startRunningDate: true,
        poster: true,
        route: {
          include: {
            checkpointTime: {
              select: {
                deadline: true,
                checkpoint: {
                  select: {
                    addressName: true,
                  },
                },
              },
            },
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
        createDate: new Date(),
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

  async getAmountDriverJoinCampaignBrand(userId: string, campaignId: string) {
    const isOwnCampaign = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
        OR: [
          { brand: { userId } },
          {
            verifyCampaign: {
              every: {
                manager: {
                  userId,
                },
              },
            },
          },
        ],
        statusCampaign: {
          in: ['OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING', 'CLOSED', 'CANCELED'],
        },
      },
    });
    if (!isOwnCampaign)
      throw new BadRequestException('You are not the owner this campaign!');

    let status = {};
    switch (isOwnCampaign.statusCampaign) {
      case 'OPEN':
        status = {
          in: ['APPROVE', 'JOIN'],
        };
        break;
      case 'PAYMENT':
      case 'WRAPPING':
      case 'RUNNING':
        status = {
          in: ['APPROVE'],
        };
        break;
      case 'CLOSED':
        status = {
          in: ['FINISH'],
        };
        break;
      case 'CANCELED':
        status = {
          in: ['CANCEL'],
        };
        break;
    }
    const count = await this.prisma.driverJoinCampaign.count({
      where: {
        campaignId,
        status,
      },
    });
    return {
      numberDriverRegistered: count,
      numberTotalCampaignDriver: isOwnCampaign.quantityDriver,
    };
  }

  async moveToNextStepCampaign(dto: StepsCampaignDTO) {
    const isCampaignExist = await this.prisma.campaign.findFirst({
      where: {
        id: dto.campaignId,
      },
    });
    if (isCampaignExist)
      throw new BadRequestException('Campaign ID is not exist');
  }

  async getAllCampaignRegisterIsExpired(globalDate?: Date) {
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        statusCampaign: 'OPEN',
      },
      include: {
        brand: {
          include: {
            user: true,
          },
        },
        driverJoinCampaign: {
          include: {
            driver: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    if (globalDate) {
      return campaigns.filter((c) => globalDate >= c.endRegisterDate);
    }
    return campaigns.filter((c) => new Date() >= c.endRegisterDate);
  }

  async getAllCampaignWrapIsExpired(globalDate?: Date) {
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        statusCampaign: 'WRAPPING',
      },
    });
    if (globalDate) {
      return campaigns.filter((c) => globalDate >= c.endWrapDate);
    }
    return campaigns.filter((c) => new Date() >= c.endWrapDate);
  }

  async getAllCampaignPaymentIsExpired(globalDate?: Date) {
    const campaigns = await this.prisma.campaign.findMany({
      include: {
        brand: {
          include: {
            user: true,
          },
        },
        driverJoinCampaign: {
          include: {
            driver: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    if (globalDate) {
      return campaigns.filter((c) => globalDate >= c.endPaymentDate);
    }
    return campaigns.filter((c) => new Date() >= c.endPaymentDate);
  }

  async getAllCampaignRunningIsExpired(globalDate?: Date) {
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        statusCampaign: 'RUNNING',
      },
      include: {
        wrap: true,
        contractCampaign: true,
        driverJoinCampaign: {
          include: {
            driverScanQRCode: true,
            drivingPhotoReport: true,
            driver: {
              include: {
                user: true,
              },
            },
          },
        },
        brand: {
          include: {
            user: true,
          },
        },
      },
    });
    if (globalDate) {
      return campaigns.filter(
        (c) => globalDate >= addDays(c.startRunningDate, c.duration - 1),
      );
    }
    return campaigns.filter(
      (c) => new Date() >= addDays(c.startRunningDate, c.duration - 1),
    );
  }

  async getAmountDriverJoinCampaignTask(campaignId: string) {
    return await this.prisma.driverJoinCampaign.count({
      where: {
        status: 'APPROVE',
        campaignId,
      },
    });
  }

  async updateStatusCampaign(
    campaignId: string,
    status: StatusCampaign,
    description?: string,
  ) {
    await this.prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        statusCampaign: status,
        description,
      },
    });
  }

  async getKilometerFinalReport(userId: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
        OR: [
          { brand: { userId } },
          { verifyCampaign: { every: { manager: { userId } } } },
        ],
        statusCampaign: {
          in: ['OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING', 'CLOSED', 'CANCELED'],
        },
      },
      select: {
        driverJoinCampaign: {
          include: {
            driverScanQRCode: true,
            drivingPhotoReport: true,
          },
        },
      },
    });
    if (!campaign)
      throw new BadRequestException('Campaign not found or not finished yet');

    return 'this function need to be replace';
  }

  async getKilometerDailyReport(
    userId: string,
    role: Role,
    campaignId: string,
  ) {
    const globalDate: Date = await this.cacheManager.get(GLOBAL_DATE);
    const where = {
      id: campaignId,
      statusCampaign: {
        in: [
          StatusCampaign.OPEN,
          StatusCampaign.PAYMENT,
          StatusCampaign.WRAPPING,
          StatusCampaign.RUNNING,
          StatusCampaign.CLOSED,
          StatusCampaign.CANCELED,
        ],
      },
    };
    if (role === 'MANAGER') {
      where['verifyCampaign'] = {
        every: {
          manager: { userId },
        },
      };
    }
    if (role === 'BRAND') {
      where['brand'] = {
        userId,
      };
    }
    const campaign = await this.prisma.campaign.findFirst({
      where,
      include: {
        driverJoinCampaign: {
          include: {
            drivingPhotoReport: true,
            driverScanQRCode: {
              include: {
                CheckpointTime: {
                  select: {
                    deadline: true,
                    checkpoint: {
                      select: {
                        addressName: true,
                      },
                    },
                  },
                },
              },
            },
            driver: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    if (!campaign)
      throw new BadRequestException('You are not the owner this campaign!');

    if (globalDate < campaign.startRunningDate) {
      return [];
    }

    const momentGlobal =
      globalDate > addDays(campaign.startRunningDate, campaign.duration - 1)
        ? addDays(campaign.startRunningDate, campaign.duration - 1)
        : globalDate;

    const totalLength = diffDates(momentGlobal, campaign.startRunningDate);

    const listDriver = (date: Date) => {
      return campaign.driverJoinCampaign.map((driverJoin) => {
        const driverScanQR = driverJoin.driverScanQRCode.filter(
          (driverTrack) => diffDates(date, driverTrack.submitTime) === 0,
        );

        const reporterImage = driverJoin?.drivingPhotoReport?.find(
          (report) => diffDates(date, report.createDate) === 0,
        );

        return {
          driverJoinCampaignId: driverJoin.id,
          carOwnerName: driverJoin?.driver?.user?.fullname,
          licensePlates: driverJoin?.driver?.licensePlates,
          driverScanQRCode: driverScanQR,
          listImage: {
            imageCarBack: reporterImage?.imageCarBack,
            imageCarLeft: reporterImage?.imageCarLeft,
            imageCarRight: reporterImage?.imageCarRight,
          },
        };
      });
    };

    const array = [];
    for (let i = 0; i <= totalLength; i++) {
      const listDriverFormat = listDriver(
        addDays(campaign.startRunningDate, i),
      );
      array.push({
        date: addDays(campaign.startRunningDate, i),
        listDriver: listDriverFormat,
      });
    }
    return array;
  }

  async getListDriverRunning(userId: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
        OR: [
          { brand: { userId } },
          { verifyCampaign: { every: { manager: { userId } } } },
        ],
        statusCampaign: {
          in: ['OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING', 'CLOSED'],
        },
      },
      include: {
        driverJoinCampaign: {
          include: {
            driverScanQRCode: true,
            drivingPhotoReport: true,
            driver: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    if (!campaign)
      throw new BadRequestException('You are not the owner this campaign!');

    return await this.prisma.driverJoinCampaign.findMany({
      where: {
        status: 'APPROVE',
        campaign: {
          id: campaignId,
          statusCampaign: 'RUNNING',
        },
      },
      include: {
        driver: {
          include: {
            user: {
              select: {
                fullname: true,
              },
            },
          },
        },
      },
    });
  }

  async triggerDriversJoinCampaign(campaignId: string) {
    const globalDate: Date = await this.cacheManager.get(GLOBAL_DATE);
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
        statusCampaign: 'OPEN',
      },
      include: {
        driverJoinCampaign: true,
      },
    });
    if (!campaign)
      throw new BadRequestException('Please input correct campaign ID');
    if (
      globalDate < campaign.startRegisterDate ||
      globalDate > campaign.endRegisterDate
    ) {
      throw new BadRequestException(
        'This campaign is not open for register. Please check register date.',
      );
    }
    const totalJoined = campaign.driverJoinCampaign.filter((c) => {
      return c.status === 'JOIN' || c.status === 'APPROVE';
    }).length;

    const quantityDriverRequire =
      Math.ceil(Number(campaign.quantityDriver) * 0.8) - 1 - totalJoined;

    if (quantityDriverRequire <= 0)
      throw new BadRequestException('You are already trigger enough drivers');

    const drivers = await this.prisma.driver.findMany({
      where: {
        campaigns: {
          none: {
            status: 'APPROVE',
          },
        },
      },
      take: quantityDriverRequire,
    });

    if (drivers.length < quantityDriverRequire) {
      this.logger.debug(
        `We dont have enough drivers to auto register driver for campaign in ${campaign.campaignName}`,
      );
      return;
    }
    const data = drivers.map((driver) => {
      return {
        campaignId: campaign.id,
        driverId: driver.id,
        description: 'Auto join',
        createDate: new Date(globalDate),
      };
    });
    await this.prisma.driverJoinCampaign.createMany({
      data,
    });
  }
}
