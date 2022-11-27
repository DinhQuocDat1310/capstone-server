import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserSignIn } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/service';
import { CampaignVerifyInformationDTO, StepsCampaignDTO } from './dto';
import { CampaignStatus, Role } from '@prisma/client';
import * as moment from 'moment';
import * as fs from 'fs';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);
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
                'FINISH',
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
              in: ['OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING', 'FINISH'],
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
          where: {
            campaign: {
              id: campaignId,
            },
            type: {
              in: ['PREPAY', 'POSTPAID'],
            },
          },
          select: {
            id: true,
            createDate: true,
            expiredDate: true,
            paidDate: true,
            type: true,
            price: true,
            isValid: true,
          },
          orderBy: {
            createDate: 'asc',
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
        isWaiting = moment() >= moment(brandOwnCampaign.startRegisterDate);
        days = moment().diff(
          moment(brandOwnCampaign.startRegisterDate),
          'days',
        );
        break;
      case 'PAYMENT':
        isWaiting =
          moment() >=
          moment(
            brandOwnCampaign.paymentDebit.find(
              (payment) => payment.type === 'PREPAY',
            ).createDate,
          );
        days = moment().diff(
          moment(
            brandOwnCampaign.paymentDebit.find(
              (payment) => payment.type === 'PREPAY',
            ).createDate,
          ),
          'days',
        );
        break;
      case 'WRAPPING':
        isWaiting = moment() >= moment(brandOwnCampaign.startWrapDate);
        days = moment().diff(moment(brandOwnCampaign.startWrapDate), 'days');
        break;
        break;
      case 'RUNNING':
        isWaiting = moment() >= moment(brandOwnCampaign.startRunningDate);
        days = moment().diff(moment(brandOwnCampaign.startRunningDate), 'days');
        break;
    }
    if (isWaiting) {
      messageWaiting = `Our system is processing, please wait ${Math.abs(
        days,
      )} days to ${brandOwnCampaign.statusCampaign}`;
    }
    return { ...brandOwnCampaign, isWaiting: `${isWaiting}`, messageWaiting };
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
                  startRunningDate: moment(dto.startRunningDate, 'MM-DD-YYYY')
                    .add(1, 'days')
                    .toDate()
                    .toLocaleDateString('vn-VN'),
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
      },
    });
    if (isCampaignNameExist)
      throw new BadRequestException('Campaign name already used!');
    const objDataConfig = JSON.parse(
      fs.readFileSync('./dataConfig.json', 'utf-8'),
    );

    if (objDataConfig.minimumKmDrive !== dto.minimumKmDrive)
      throw new BadRequestException(
        `Minimum Km must drive/day is ${objDataConfig.minimumKmDrive}`,
      );
    const campaign = await this.prisma.campaign.create({
      data: {
        campaignName: dto.campaignName,
        startRunningDate: moment(dto.startRunningDate, 'MM-DD-YYYY')
          .toDate()
          .toLocaleDateString('vn-VN'),
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
        createDate: moment().toDate().toLocaleDateString('vn-VN'),
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
          in: ['OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING', 'FINISH', 'CLOSED'],
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

  async getAllCampaignRegisterIsExpired() {
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        statusCampaign: 'OPEN',
      },
    });
    return campaigns.filter(
      (c) => moment() >= moment(c.endRegisterDate, 'MM-DD-YYYY'),
    );
  }

  async getAllCampaignWrapIsExpired() {
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        statusCampaign: 'WRAPPING',
      },
    });
    return campaigns.filter(
      (c) => moment() >= moment(c.endWrapDate, 'MM-DD-YYYY'),
    );
  }

  async getAllCampaignRunningIsExpired() {
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        statusCampaign: 'RUNNING',
      },
      include: {
        wrap: true,
        contractCampaign: true,
        driverJoinCampaign: {
          include: {
            driverTrackingLocation: {
              include: {
                tracking: true,
              },
            },
          },
        },
        paymentDebit: true,
      },
    });
    return campaigns.filter(
      (c) =>
        moment() >=
        moment(c.startRunningDate, 'MM-DD-YYYY').add(
          Number(c.duration),
          'days',
        ),
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
    status: CampaignStatus,
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
          in: ['OPEN', 'PAYMENT', 'WRAPPING', 'FINISH', 'RUNNING', 'CLOSED'],
        },
      },
      select: {
        totalKm: true,
        driverJoinCampaign: {
          include: {
            driverTrackingLocation: {
              select: {
                tracking: {
                  select: {
                    totalMeterDriven: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!campaign)
      throw new BadRequestException('Campaign not found or not finished yet');
    let totalMeterFinalReport = 0;

    const driverTracking = campaign.driverJoinCampaign;

    driverTracking.forEach((driver) =>
      driver.driverTrackingLocation.forEach((track) =>
        track.tracking.forEach(
          (total) => (totalMeterFinalReport += Number(total.totalMeterDriven)),
        ),
      ),
    );
    const totalKm = campaign.totalKm;
    return {
      totalKm,
      totalKmFinalReport: totalMeterFinalReport / 1000,
    };
  }

  async getKilometerDailyReport(
    userId: string,
    role: Role,
    campaignId: string,
  ) {
    const where = {
      id: campaignId,
      statusCampaign: {
        in: [
          CampaignStatus.OPEN,
          CampaignStatus.PAYMENT,
          CampaignStatus.WRAPPING,
          CampaignStatus.RUNNING,
          CampaignStatus.CLOSED,
          CampaignStatus.FINISH,
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
            reporterDriverCampaign: true,
            driverTrackingLocation: {
              include: {
                tracking: true,
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

    const totalKmPerDay = Number(campaign.totalKm) / Number(campaign.duration);
    const totalLength = Math.abs(
      moment().diff(moment(campaign.startRunningDate, 'MM-DD-YYYY'), 'days'),
    );

    const listDriver = (date: string) => {
      return campaign.driverJoinCampaign.map((driverJoin) => {
        const driverTracking = driverJoin.driverTrackingLocation.find(
          (driverTrack) =>
            moment(date, 'MM-DD-YYYY').diff(
              moment(driverTrack.createDate, 'MM-DD-YYYY'),
              'days',
            ) === 0,
        );
        const totalKm =
          driverTracking?.tracking?.reduce(
            (acc, driver) => acc + Number(driver.totalMeterDriven),
            0,
          ) ?? 0;

        const reporterImage = driverJoin?.reporterDriverCampaign?.find(
          (report) =>
            moment(date, 'MM-DD-YYYY').diff(
              moment(report.createDate, 'MM-DD-YYYY'),
              'days',
            ) === 0,
        );

        return {
          driverJoinCampaignId: driverJoin.id,
          carOwnerName: driverJoin?.driver?.user?.fullname,
          phoneNumber: driverJoin?.driver?.user?.phoneNumber,
          carId: driverJoin?.driver?.idCar,
          totalKm,
          listImage: {
            imageCarBack: reporterImage?.imageCarBack,
            imageCarLeft: reporterImage?.imageCarLeft,
            imageCarRight: reporterImage?.imageCarRight,
            imageCarOdo: reporterImage?.imageCarOdo,
          },
        };
      });
    };

    const array = [];
    for (let i = 0; i <= totalLength; i++) {
      const listDriverFormat = listDriver(
        moment(campaign.startRunningDate, 'MM-DD-YYYY')
          .add(i, 'days')
          .toDate()
          .toLocaleDateString('vn-VN'),
      );
      const totalKmDriven = listDriverFormat.reduce((acc, driver) => {
        return acc + Number(driver.totalKm);
      }, 0);

      array.push({
        date: moment(campaign.startRunningDate, 'MM-DD-YYYY')
          .add(i, 'days')
          .toDate()
          .toLocaleDateString('vn-VN'),
        totalKm: totalKmPerDay,
        totalKmDriven: totalKmDriven / 1000,
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
          in: ['OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING', 'FINISH', 'CLOSED'],
        },
      },
      include: {
        driverJoinCampaign: {
          include: {
            reporterDriverCampaign: true,
            driverTrackingLocation: {
              include: {
                tracking: true,
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
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
        statusCampaign: 'OPEN',
      },
      include: {
        locationCampaign: true,
        driverJoinCampaign: true,
      },
    });
    if (
      moment() > moment(campaign.endRegisterDate, 'MM-DD-YYYY') ||
      moment() < moment(campaign.startRegisterDate, 'MM-DD-YYYY')
    ) {
      throw new BadRequestException(
        'This campaign is not open for register, can you re-check the date!',
      );
    }
    const totalJoined = campaign.driverJoinCampaign.filter((c) => {
      return c.status === 'JOIN' || c.status === 'APPROVE';
    }).length;

    const quantityDriverRequire =
      Math.ceil(Number(campaign.quantityDriver) * 0.8) - 1 - totalJoined;

    const drivers = await this.prisma.driver.findMany({
      where: {
        user: {
          address: campaign.locationCampaign.locationName,
        },
      },
      take: quantityDriverRequire,
    });

    if (drivers.length < quantityDriverRequire) {
      this.logger.debug(
        `We dont have enough drivers to auto register driver for campaign in ${campaign.locationCampaign.locationName}`,
      );
      return;
    }
    const data = drivers.map((driver) => {
      return {
        campaignId: campaign.id,
        driverId: driver.id,
        description: 'Auto join',
        createDate: moment().toDate().toLocaleDateString('vn-VN'),
      };
    });
    await this.prisma.driverJoinCampaign.createMany({
      data,
    });
  }
}
