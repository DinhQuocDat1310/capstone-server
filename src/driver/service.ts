import {
  BadRequestException,
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserSignIn } from 'src/auth/dto';
import { AppConfigService } from 'src/config/appConfigService';
import { UsersService } from 'src/user/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { PrismaService } from './../prisma/service';
import { DriverTrackingLocation, DriverVerifyInformationDTO } from './dto';
import * as moment from 'moment';
import { CampaignStatus, StatusDriverJoin } from '@prisma/client';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);
  constructor(
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

  async driverJoinCampaigin(campaignId: string, userReq: UserSignIn) {
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
        },
        include: {
          locationCampaign: true,
        },
      });
      if (!campaign)
        throw new BadRequestException(
          'The campaignId is not exist!. Please make sure you join correct Campaign',
        );

      if (driver.user.address !== campaign.locationCampaign.locationName) {
        throw new Error('This campaign is not host in your location!!!');
      }

      const now = moment(new Date());
      if (
        now < moment(campaign.startRegisterDate) ||
        now > moment(campaign.endRegisterDate)
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

      const latestCampaign = await this.prisma.driverJoinCampaign.findFirst({
        where: {
          driverId: driver.id,
          status: StatusDriverJoin.APPROVE,
        },
        orderBy: {
          createDate: 'desc',
        },
        include: {
          campaign: true,
        },
      });
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
        listDriversJoinCampaign.length >=
        Math.floor((Number(campaign.quantityDriver) * 80) / 100);

      await this.prisma.driverJoinCampaign.create({
        data: {
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
        listDriversJoinCampaign.length + 1 ===
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
          status: 'JOIN',
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

    const campaignApprove = campaigns.find((cam) => cam.status === 'APPROVE');
    if (campaignApprove) {
      const now = moment(new Date());
      const campaignDayCount = now.diff(
        moment(campaignApprove.campaign.startRunningDate),
        'days',
      );

      campaignApprove['campaignDayCount'] = campaignDayCount;
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
      delete c.campaign.driverJoinCampaign;
      return {
        ...c,
      };
    });
  }

  async saveCurrentLocationDriverByDate(dto: DriverTrackingLocation) {
    const driverJoinCampaign = await this.prisma.driverJoinCampaign.findFirst({
      where: {
        id: dto.idDriverJoinCampaign,
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

    const toDay = moment();
    let isDriverTrackingLocationExist = listDriverTrackingLocation.find(
      (track) => {
        return toDay.diff(moment(track.createDate), 'days') === 0;
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
      },
    });
  }
  async getTotalKmByCurrentDate(driverJoinCampaignId: string) {
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
        moment(new Date()).diff(driverTracking.createDate, 'days') === 0,
    );
    if (!driverTrackingLocation) return 0;
    const listTracking = await this.prisma.tracking.findMany({
      where: {
        driverTrackingLocationId: driverTrackingLocation.id,
        OR: [
          {
            timeSubmit: {
              lte: new Date(),
            },
          },
          {
            timeSubmit: {
              gte: new Date(),
            },
          },
        ],
      },
    });
    let total = 0;
    listTracking.forEach((track) => {
      total += Number(track.totalMeterDriven);
    });
    return total;
  }

  async getTotalKmTraveled(userId: string) {
    const campaigns = await this.prisma.driverJoinCampaign.findMany({
      where: {
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
      select: {
        id: true,
        status: true,
      },
    });

    const campaignApprove = campaigns.find((cam) => cam.status === 'APPROVE');

    if (campaignApprove) {
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
      const kmTraveled = (campaignApprove['totalKmTraveled'] = totalKmTraveled);
      return campaigns.filter((total) => {
        delete total.id;
        delete total.status;
        return {
          kmTraveled,
        };
      });
    }
  }
}
