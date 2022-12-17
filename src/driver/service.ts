import {
  BadRequestException,
  Injectable,
  Logger,
  InternalServerErrorException,
  CACHE_MANAGER,
  Inject,
} from '@nestjs/common';
import { UserSignIn } from 'src/auth/dto';
import { AppConfigService } from 'src/config/appConfigService';
import { UsersService } from 'src/user/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { PrismaService } from './../prisma/service';
import { DriverTrackingLocation, DriverVerifyInformationDTO } from './dto';
import * as moment from 'moment';
import { CampaignStatus, StatusDriverJoin } from '@prisma/client';
import { Cache } from 'cache-manager';
import { GLOBAL_DATE } from 'src/constants/cache-code';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly configService: AppConfigService,
    private readonly usersService: UsersService,
  ) {}

  async updateDriverVerify(
    dto: DriverVerifyInformationDTO,
    userReq: UserSignIn,
  ) {
    const user = await this.usersService.getUserDriverInfo(
      dto.email,
      userReq.role,
    );
    const latestVerifyStatus = user.driver.verify[0]?.status;
    if (latestVerifyStatus === 'NEW' || latestVerifyStatus === 'PENDING') {
      throw new BadRequestException(
        'Your account is on processing, we will reponse back in 1 to 3 working days',
      );
    }
    if (latestVerifyStatus === 'ACCEPT' || latestVerifyStatus === 'BANNED') {
      throw new BadRequestException(
        `Your account is already processed, please check your sms/phoneNumber or contact with ${this.configService.getConfig(
          'MAILER',
        )} for more information`,
      );
    }
    if (user.phoneNumber !== dto.phoneNumber) {
      await this.usersService.checkEmailOrPhoneNumberIsExist(
        '',
        dto.phoneNumber,
        'This phone number is already used',
      );
    }
    if (user.idCitizen !== dto.idCitizen) {
      await this.usersService.checkIdIsExist({
        idCitizen: dto.idCitizen,
        message: 'This id card citizen is already used',
      });
    }

    if (user.driver.idCar !== dto.idCar) {
      await this.usersService.checkIdIsExist({
        idCar: dto.idCar,
        message: 'This idCar is already used',
      });
    }

    if (user.driver.bankAccountNumber !== dto.bankAccountNumber) {
      await this.usersService.checkIdIsExist({
        bankAccountNumber: dto.bankAccountNumber,
        message: 'This bank account number is already used',
      });
    }

    try {
      if (!latestVerifyStatus) {
        await this.verifyAccountService.createNewRequestVerifyDriverAccount(
          user.driver.id,
        );
      } else if (latestVerifyStatus === 'UPDATE') {
        await this.verifyAccountService.createPendingRequestVerifyDriverAccount(
          user.driver.id,
          user.driver.verify[0].managerId,
        );
      }

      await this.usersService.updateUserDriverInformation(userReq.id, dto);
      return 'updated';
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async driverJoinCampaign(campaignId: string, userReq: UserSignIn) {
    const globalDate = await this.cacheManager.get(GLOBAL_DATE);
    try {
      const driver = await this.prisma.driver.findFirst({
        where: {
          userId: userReq.id,
        },
        include: {
          user: true,
        },
      });
      const campaign = await this.prisma.campaign.findFirst({
        where: {
          id: campaignId,
          statusCampaign: 'OPEN',
        },
        include: {
          locationCampaign: true,
        },
      });
      if (!campaign)
        throw new BadRequestException(
          'The campaignId is not exist or not open!. Please make sure you join correct Campaign',
        );

      if (driver.user.address !== campaign.locationCampaign.locationName) {
        throw new Error('This campaign is not host in your location!!!');
      }

      if (
        moment(globalDate, 'MM/DD/YYYY') <
          moment(campaign.startRegisterDate, 'MM/DD/YYYY') ||
        moment(globalDate, 'MM/DD/YYYY') >
          moment(campaign.endRegisterDate, 'MM/DD/YYYY')
      ) {
        throw new BadRequestException(
          'This campaign is not open for register, can you re-check the date!',
        );
      }
      const listDriversJoinCampaign =
        await this.prisma.driverJoinCampaign.findMany({
          where: {
            campaignId,
          },
        });
      if (listDriversJoinCampaign.find((o) => o.driverId === driver.id))
        throw new BadRequestException('You already join this campaign');

      if (listDriversJoinCampaign.length >= Number(campaign.quantityDriver))
        throw new BadRequestException(
          'This Campaign is full now, Please join the other campaigns',
        );

      const campaigns = await this.prisma.driverJoinCampaign.findMany({
        where: {
          driverId: driver.id,
          status: StatusDriverJoin.APPROVE,
        },
        include: {
          campaign: true,
        },
      });
      campaigns.sort(
        (a, b) =>
          moment(b.createDate, 'MM/DD/YYYY').valueOf() -
          moment(a.createDate, 'MM/DD/YYYY').valueOf(),
      );
      const latestCampaign = campaigns[0];
      if (latestCampaign) {
        if (
          ['OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING'].includes(
            latestCampaign.campaign.statusCampaign,
          )
        ) {
          throw new BadRequestException(
            'You are already in campaign, you cannot join two campaigns in the same time',
          );
        }
      }

      this.logger.debug(
        'Number of Drivers join campaign: ',
        listDriversJoinCampaign.length,
      );

      const isApproveCampaign =
        listDriversJoinCampaign.length + 1 >=
        Number(campaign.quantityDriver) * 0.8;

      await this.prisma.driverJoinCampaign.create({
        data: {
          createDate: moment(globalDate, 'MM/DD/YYYY')
            .toDate()
            .toLocaleDateString('vn-VN'),
          campaign: {
            connect: {
              id: campaignId,
            },
          },
          driver: {
            connect: {
              id: driver.id,
            },
          },
          status: isApproveCampaign
            ? StatusDriverJoin.APPROVE
            : StatusDriverJoin.JOIN,
        },
      });
      const isUpdateAllDriverJoinCampaign =
        listDriversJoinCampaign.length >=
        Math.floor((Number(campaign.quantityDriver) * 80) / 100);

      //Just wanna this method is running only one
      if (isUpdateAllDriverJoinCampaign) {
        this.logger.log('Tada >= 80% driver :)), enough for campaign working');
        const listDriver = await this.prisma.driverJoinCampaign.findMany({
          where: {
            campaignId,
          },
        });

        await this.prisma.driverJoinCampaign.updateMany({
          where: {
            campaignId,
          },
          data: {
            status: StatusDriverJoin.APPROVE,
          },
        });
        for (let i = 0; i < listDriver.length; i++) {
          await this.prisma.driverJoinCampaign.updateMany({
            where: {
              driverId: listDriver[i].driverId,
              NOT: {
                campaignId,
              },
            },
            data: {
              status: StatusDriverJoin.CANCEL,
              description: `this campaign ${campaign.campaignName} is eligible to start!`,
            },
          });
        }
      }
    } catch (e) {
      this.logger.error(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async getListCampaigns(userId: string, address: string) {
    const driver = await this.prisma.driver.findFirst({
      where: {
        userId,
      },
    });

    const campaigns = await this.prisma.campaign.findMany({
      where: {
        statusCampaign: {
          in: ['OPEN'],
        },
        locationCampaign: {
          locationName: address,
        },
      },
      include: {
        brand: {
          select: {
            brandName: true,
            logo: true,
          },
        },
        locationCampaign: {
          select: {
            id: true,
            locationName: true,
          },
        },
        wrap: {
          select: {
            id: true,
            positionWrap: true,
          },
        },
      },
      orderBy: {
        startRegisterDate: 'desc',
      },
    });

    for (let i = 0; i < campaigns.length; i++) {
      const isJoined = await this.prisma.driverJoinCampaign.findFirst({
        where: {
          driverId: driver.id,
          campaignId: campaigns[i].id,
          status: {
            in: ['JOIN', 'APPROVE'],
          },
        },
      });
      const countDriver = await this.prisma.driverJoinCampaign.count({
        where: {
          campaignId: campaigns[i].id,
        },
      });
      const totalMoneyPerDriver =
        Number(campaigns[i].wrapPrice) +
        Number(campaigns[i].minimumKmDrive) *
          Number(campaigns[i].duration) *
          Number(campaigns[i].locationPricePerKm);

      campaigns[i]['totalMoneyPerDriver'] = totalMoneyPerDriver;
      campaigns[i]['quantityDriverJoinning'] = countDriver;
      campaigns[i]['closeDateCampaign'] = moment(
        campaigns[i].startRunningDate,
        'MM/DD/YYYY',
      )
        .add(Number(campaigns[i].duration) - 1, 'days')
        .toDate()
        .toLocaleDateString('vn-VN');
      campaigns[i]['isJoined'] = isJoined ? true : false;
    }

    return campaigns;
  }

  async updateAllStatusDriverJoinCampaign(
    campaignId: string,
    status: StatusDriverJoin,
    description?: string,
  ) {
    await this.prisma.driverJoinCampaign.updateMany({
      where: {
        campaignId,
      },
      data: {
        description,
        status,
      },
    });
  }

  async getCampaignJoiningAndJoined(userId: string) {
    const globalDate = await this.cacheManager.get(GLOBAL_DATE);
    const campaigns = await this.prisma.driverJoinCampaign.findMany({
      where: {
        driver: {
          userId,
        },
        status: {
          in: ['APPROVE', 'JOIN'],
        },
        campaign: {
          statusCampaign: {
            in: ['OPEN', 'PAYMENT', 'RUNNING', 'WRAPPING'],
          },
        },
      },
      include: {
        campaign: {
          include: {
            driverJoinCampaign: true,
            brand: {
              select: {
                brandName: true,
                logo: true,
              },
            },
            locationCampaign: {
              select: {
                id: true,
                locationName: true,
                addressPoint: true,
              },
            },
            wrap: {
              select: {
                id: true,
                positionWrap: true,
              },
            },
          },
        },
      },
    });
    if (campaigns.length === 0) return [];
    const campaignApprove = campaigns.find((cam) => cam.status === 'APPROVE');
    if (campaignApprove) {
      const campaignDayCount = moment(globalDate, 'MM/DD/YYYY').diff(
        moment(campaignApprove.campaign.startRunningDate, 'MM/DD/YYYY'),
        'days',
      );

      campaignApprove['campaignDayCount'] = Math.abs(campaignDayCount);
      const totalMoneyPerDriver =
        Number(campaignApprove.campaign.wrapPrice) +
        Number(campaignApprove.campaign.minimumKmDrive) *
          Number(campaignApprove.campaign.duration) *
          Number(campaignApprove.campaign.locationPricePerKm);

      campaignApprove.campaign['totalMoneyPerDriver'] = totalMoneyPerDriver;
      campaignApprove.campaign['quantityDriverJoining'] =
        campaignApprove.campaign.driverJoinCampaign.length;
      const listTracking = await this.prisma.tracking.findMany({
        where: {
          driverTrackingLocation: {
            driverJoinCampaignId: campaignApprove.id,
          },
        },
        select: {
          totalMeterDriven: true,
        },
      });

      let totalKmTraveled = 0;
      listTracking.forEach((track) => {
        totalKmTraveled += Number(track.totalMeterDriven);
      });
      campaignApprove.campaign['totalKmTraveled'] = totalKmTraveled;
      campaignApprove.campaign['closeDateCampaign'] = moment(
        campaignApprove.campaign.startRunningDate,
        'MM/DD/YYYY',
      )
        .add(Number(campaignApprove.campaign.duration) - 1, 'days')
        .toDate()
        .toLocaleDateString('vn-VN');

      campaignApprove.campaign['isWaiting'] =
        moment(globalDate, 'MM/DD/YYYY') <
        moment(campaignApprove.campaign.startRunningDate, 'MM/DD/YYYY');

      delete campaignApprove.campaign.driverJoinCampaign;
      return campaigns;
    }
    return campaigns.map((c) => {
      c.campaign['quantityDriverJoining'] =
        c.campaign.driverJoinCampaign.length;
      c.campaign['totalMoneyPerDriver'] =
        Number(c.campaign.wrapPrice) +
        Number(c.campaign.minimumKmDrive) *
          Number(c.campaign.duration) *
          Number(c.campaign.locationPricePerKm);
      c.campaign['closeDateCampaign'] = moment(
        c.campaign.startRunningDate,
        'MM/DD/YYYY',
      )
        .add(Number(c.campaign.duration) - 1, 'days')
        .toDate()
        .toLocaleDateString('vn-VN');
      delete c.campaign.driverJoinCampaign;
      return {
        ...c,
      };
    });
  }

  async saveCurrentLocationDriverByDate(
    userId: string,
    dto: DriverTrackingLocation,
  ) {
    const globalDate = await this.cacheManager.get(GLOBAL_DATE);
    const driver = await this.prisma.driver.findFirst({
      where: {
        userId,
      },
    });
    this.logger.debug(dto.idDriverJoinCampaign);
    this.logger.debug(driver.idCar);

    const driverJoinCampaignWithDriverId =
      await this.prisma.driverJoinCampaign.findFirst({
        where: {
          id: dto.idDriverJoinCampaign,
          driverId: driver.id,
          campaign: {
            statusCampaign: CampaignStatus.RUNNING,
          },
        },
      });
    this.logger.debug(
      driverJoinCampaignWithDriverId?.campaignId,
      driverJoinCampaignWithDriverId?.status,
    );
    const driverJoinCampaign = await this.prisma.driverJoinCampaign.findFirst({
      where: {
        id: dto.idDriverJoinCampaign,
        driver: {
          userId,
        },
        campaign: {
          statusCampaign: CampaignStatus.RUNNING,
        },
      },
    });
    this.logger.debug(
      driverJoinCampaign?.campaignId,
      driverJoinCampaign.status,
    );
    if (!driverJoinCampaign)
      throw new BadRequestException(
        'This campaign id is already closed or you are not running this campaign, please contact to admin to get more details.',
      );

    const listDriverTrackingLocation =
      await this.prisma.driverTrackingLocation.findMany({
        where: {
          driverJoinCampaignId: driverJoinCampaign.id,
        },
      });

    let isDriverTrackingLocationExist = listDriverTrackingLocation.find(
      (track) => {
        return (
          moment(globalDate, 'MM/DD/YYYY').diff(
            moment(track.createDate, 'MM/DD/YYYY'),
            'days',
          ) === 0
        );
      },
    );

    if (!isDriverTrackingLocationExist) {
      isDriverTrackingLocationExist =
        await this.prisma.driverTrackingLocation.create({
          data: {
            driverJoinCampaign: {
              connect: {
                id: driverJoinCampaign.id,
              },
            },
            createDate: moment(globalDate, 'MM/DD/YYYY')
              .toDate()
              .toLocaleDateString('vn-VN'),
          },
        });
    }

    await this.prisma.tracking.create({
      data: {
        totalMeterDriven: dto.totalMeterDriver,
        driverTrackingLocation: {
          connect: {
            id: isDriverTrackingLocationExist.id,
          },
        },
        timeSubmit: moment(globalDate, 'MM/DD/YYYY')
          .toDate()
          .toLocaleDateString('vn-VN', { hour: 'numeric', minute: 'numeric' }),
      },
    });
  }
  async getTotalKmByCurrentDate(driverJoinCampaignId: string) {
    const globalDate = await this.cacheManager.get(GLOBAL_DATE);
    const driverJoinCampaign = await this.prisma.driverJoinCampaign.findFirst({
      where: {
        id: driverJoinCampaignId,
        campaign: {
          statusCampaign: CampaignStatus.RUNNING,
        },
      },
    });
    if (!driverJoinCampaign)
      throw new BadRequestException(
        'This campaign id is already closed, please contact to admin to get more details.',
      );

    const listDriverTrackingLocation =
      await this.prisma.driverTrackingLocation.findMany({
        where: {
          driverJoinCampaignId: driverJoinCampaign.id,
        },
      });

    const driverTrackingLocation = listDriverTrackingLocation.find(
      (driverTracking) =>
        moment(globalDate, 'MM/DD/YYYY').diff(
          moment(driverTracking.createDate, 'MM/DD/YYYY'),
          'days',
        ) === 0,
    );
    if (!driverTrackingLocation) return 0;
    const listTracking = await this.prisma.tracking.findMany({
      where: {
        driverTrackingLocationId: driverTrackingLocation.id,
      },
    });
    let total = 0;
    listTracking.forEach((track) => {
      total += Number(track.totalMeterDriven);
    });
    return total;
  }

  async getTotalKmTraveled(userId: string) {
    const tracking = await this.prisma.tracking.findMany({
      where: {
        driverTrackingLocation: {
          driverJoinCampaign: {
            driver: {
              userId,
            },
            status: {
              in: ['APPROVE'],
            },
            campaign: {
              statusCampaign: {
                in: ['OPEN', 'PAYMENT', 'RUNNING', 'WRAPPING'],
              },
            },
          },
        },
      },
      select: {
        totalMeterDriven: true,
      },
    });

    let totalKmTraveled = 0;
    tracking.forEach((track) => {
      totalKmTraveled += Number(track.totalMeterDriven);
    });
    return totalKmTraveled;
  }

  async getHistoryCampaignFinished(userId: string) {
    const driverJoinCampaign = await this.prisma.driverJoinCampaign.findMany({
      where: {
        driver: {
          userId,
        },
        status: 'FINISH',
        campaign: {
          statusCampaign: {
            in: ['FINISH', 'CLOSED'],
          },
        },
      },
      select: {
        id: true,
        driverTrackingLocation: {
          select: {
            id: true,
          },
        },
        campaign: {
          select: {
            id: true,
            campaignName: true,
            startRunningDate: true,
            duration: true,
            poster: true,
            statusCampaign: true,
            minimumKmDrive: true,
            locationPricePerKm: true,
            locationCampaign: {
              select: {
                locationName: true,
              },
            },
            wrapPrice: true,
            wrap: {
              select: {
                positionWrap: true,
              },
            },
            totalKm: true,
          },
        },
      },
    });
    const array = [];
    for (let index = 0; index < driverJoinCampaign.length; index++) {
      let totalKmTraveled = 0;
      const getTotalKmEachCampaign =
        await this.prisma.driverTrackingLocation.findMany({
          where: {
            driverJoinCampaignId: driverJoinCampaign[index].id,
          },
          select: {
            driverJoinCampaignId: true,
            tracking: {
              select: {
                totalMeterDriven: true,
              },
            },
          },
        });
      getTotalKmEachCampaign.forEach((driver) =>
        driver.tracking.forEach(
          (track) => (totalKmTraveled += Number(track.totalMeterDriven)),
        ),
      );
      array.push(totalKmTraveled);
    }

    const dataRes = driverJoinCampaign.map((driver) => {
      const endDateCampaign = moment(
        driver.campaign.startRunningDate,
        'MM/DD/YYYY',
      )
        .add(Number(driver.campaign.duration) - 1, 'days')
        .toDate()
        .toLocaleDateString('vn-VN');
      const totalMoneyEarned =
        Number(driver.campaign.wrapPrice) +
        Number(driver.campaign.minimumKmDrive) *
          Number(driver.campaign.duration) *
          Number(driver.campaign.locationPricePerKm);
      const campaign = driver.campaign;
      const locationName = driver.campaign.locationCampaign.locationName;
      const positionWrap = driver.campaign.wrap.positionWrap;
      delete driver.campaign.locationCampaign;
      delete driver.campaign.wrap;
      delete driver.driverTrackingLocation;
      delete driver.campaign;
      return {
        ...campaign,
        locationName,
        positionWrap,
        endDateCampaign,
        totalMoneyEarned,
      };
    });
    for (let index = 0; index < array.length; index++) {
      dataRes[index]['totalKmRun'] = array[index];
    }
    return dataRes;
  }
}
