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
import { StatusDriverJoin } from '@prisma/client';
import { Cache } from 'cache-manager';
import { GLOBAL_DATE, OPTIONS_DATE } from 'src/constants/cache-code';
import { addDays, diffDates } from 'src/utilities';

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
    if (user.idCitizen !== dto.idCitizen) {
      await this.usersService.checkIdIsExist({
        idCitizen: dto.idCitizen,
        message: 'This id card citizen is already used',
      });
    }

    if (user.driver.licensePlates !== dto.licensePlates) {
      await this.usersService.checkIdIsExist({
        licensePlates: dto.licensePlates,
        message: 'This idCar is already used',
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
    const globalDate: Date = new Date(await this.cacheManager.get(GLOBAL_DATE));
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
      });
      if (!campaign)
        throw new BadRequestException(
          'The campaignId is not exist or not open!. Please make sure you join correct Campaign',
        );

      if (
        globalDate < campaign.startRegisterDate ||
        globalDate > campaign.endRegisterDate
      ) {
        throw new BadRequestException(
          'This campaign is not open for register. Please check register date.',
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
      campaigns.sort((a, b) => b.createDate.valueOf() - a.createDate.valueOf());
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
          createDate: globalDate,
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
      },
      include: {
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
                    longitude: true,
                    latitude: true,
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
        campaigns[i].wrapPrice +
        campaigns[i].route.price * campaigns[i].duration;

      campaigns[i]['totalMoneyPerDriver'] = totalMoneyPerDriver;
      campaigns[i]['quantityDriverJoinning'] = countDriver;
      campaigns[i]['closeDateCampaign'] = addDays(
        campaigns[i].startRunningDate,
        campaigns[i].duration - 1,
      );
      campaigns[i]['isJoined'] = isJoined ? true : false;
    }

    return campaigns.map((c) => {
      const checkpointTime = c.route.checkpointTime.map((t, index) => {
        return {
          ...t,
          deadline:
            index === 0
              ? `7:00 - ${t.deadline}`
              : `${c.route.checkpointTime[index - 1].deadline} - ${t.deadline}`,
        };
      });
      return {
        ...c,
        route: {
          ...c.route,
          checkpointTime,
        },
      };
    });
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

  async updateAllStatusDriverJoinToStatus(
    campaignId: string,
    status: StatusDriverJoin,
    description?: string,
  ) {
    await this.prisma.driverJoinCampaign.updateMany({
      where: {
        campaignId,
        status: 'JOIN',
      },
      data: {
        description,
        status,
      },
    });
  }

  async updateAllStatusDriverApproveToStatus(
    campaignId: string,
    status: StatusDriverJoin,
    description?: string,
  ) {
    await this.prisma.driverJoinCampaign.updateMany({
      where: {
        campaignId,
        status: 'APPROVE',
      },
      data: {
        description,
        status,
      },
    });
  }

  async getCampaignJoiningAndJoined(userId: string) {
    const globalDate: Date = new Date(await this.cacheManager.get(GLOBAL_DATE));
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
            route: {
              include: {
                checkpointTime: {
                  select: {
                    deadline: true,
                    checkpoint: {
                      select: {
                        latitude: true,
                        longitude: true,
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
              },
            },
          },
        },
      },
    });
    if (campaigns.length === 0) return [];
    const campaignApprove = campaigns.find((cam) => cam.status === 'APPROVE');
    if (campaignApprove) {
      const campaignDayCount = diffDates(
        globalDate,
        campaignApprove.campaign.startRunningDate,
      );

      campaignApprove['campaignDayCount'] = Math.abs(campaignDayCount);
      const totalMoneyPerDriver =
        campaignApprove.campaign.wrapPrice +
        campaignApprove.campaign.route.price *
          campaignApprove.campaign.duration;

      campaignApprove.campaign['totalMoneyPerDriver'] = totalMoneyPerDriver;
      campaignApprove.campaign['quantityDriverJoining'] =
        campaignApprove.campaign.driverJoinCampaign.length;

      campaignApprove.campaign['closeDateCampaign'] = addDays(
        campaignApprove.campaign.startRunningDate,
        campaignApprove.campaign.duration - 1,
      );
      campaignApprove.campaign['isWaiting'] =
        globalDate < campaignApprove.campaign.startRunningDate;

      delete campaignApprove.campaign.driverJoinCampaign;

      return campaigns.map((c) => {
        const checkpointTime = c.campaign.route.checkpointTime.map(
          (t, index) => {
            return {
              ...t,
              deadline:
                index === 0
                  ? `7:00 - ${t.deadline}`
                  : `${c.campaign.route.checkpointTime[index - 1].deadline} - ${
                      t.deadline
                    }`,
            };
          },
        );
        return {
          ...c,
          campaign: {
            ...c.campaign,
            route: {
              ...c.campaign.route,
              checkpointTime,
            },
          },
        };
      });
    }
    return campaigns.map((c) => {
      c.campaign['quantityDriverJoining'] =
        c.campaign.driverJoinCampaign.length;
      c.campaign['totalMoneyPerDriver'] =
        Number(c.campaign.wrapPrice) +
        Number(c.campaign.route.price) * Number(c.campaign.duration);
      c.campaign['closeDateCampaign'] = addDays(
        c.campaign.startRunningDate,
        c.campaign.duration - 1,
      );
      delete c.campaign.driverJoinCampaign;

      const checkpointTime = c.campaign.route.checkpointTime.map((t, index) => {
        return {
          ...t,
          deadline:
            index === 0
              ? `7:00 - ${t.deadline}`
              : `${c.campaign.route.checkpointTime[index - 1].deadline} - ${
                  t.deadline
                }`,
        };
      });
      return {
        ...c,
        campaign: {
          ...c.campaign,
          route: {
            ...c.campaign.route,
            checkpointTime,
          },
        },
      };
    });
  }

  async saveCurrentLocationDriverByDate(
    userId: string,
    dto: DriverTrackingLocation,
  ) {
    return 'this logic save current location need to be change';
  }

  async getTotalKmByCurrentDate(driverJoinCampaignId: string) {
    return 'this logic get total km need to be change';
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
            in: ['CLOSED'],
          },
        },
      },
      select: {
        campaign: {
          select: {
            startRunningDate: true,
            duration: true,
            campaignName: true,
            poster: true,
            wrapPrice: true,
            wrap: {
              select: {
                positionWrap: true,
              },
            },
            route: {
              include: {
                checkpointTime: {
                  include: {
                    checkpoint: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return driverJoinCampaign.map((d) => {
      const checkpointTime = d.campaign.route.checkpointTime.map((t, index) => {
        return {
          ...t,
          deadline:
            index === 0
              ? `7:00 - ${t.deadline}`
              : `${d.campaign.route.checkpointTime[index - 1].deadline} - ${
                  t.deadline
                }`,
        };
      });
      return {
        ...d,
        driverMoney:
          Number(d.campaign.route.price) + Number(d.campaign.wrapPrice),
        campaign: {
          ...d.campaign,
          startRunningDate: new Date(
            d.campaign.startRunningDate,
          ).toLocaleDateString('vn-VN', OPTIONS_DATE),
          closeCampaignDate: addDays(
            d.campaign.startRunningDate,
            d.campaign.duration - 1,
          ).toLocaleDateString('vn-VN', OPTIONS_DATE),
          route: {
            ...d.campaign.route,
            checkpointTime,
          },
        },
      };
    });
  }

  async getAllCheckpoints(driverJoinCampaignId: string) {
    const globalDate: Date = new Date(await this.cacheManager.get(GLOBAL_DATE));
    const start = new Date(globalDate);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(globalDate);
    end.setUTCHours(23, 59, 59, 999);

    const driverJoinCampaign = await this.prisma.driverJoinCampaign.findFirst({
      where: {
        id: driverJoinCampaignId,
        campaign: {
          statusCampaign: 'RUNNING',
        },
      },
      include: {
        driverScanQRCode: true,
        campaign: {
          select: {
            duration: true,
            route: {
              select: {
                checkpointTime: {
                  select: {
                    id: true,
                    checkpoint: {
                      select: {
                        addressName: true,
                        latitude: true,
                        longitude: true,
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

    if (!driverJoinCampaign)
      throw new BadRequestException(
        'You are not running this campaign or this campaign is not running yet',
      );

    let scanCheckpointsToday = await this.prisma.driverScanQRCode.findMany({
      where: {
        driverJoinCampaignId: driverJoinCampaign.id,
        createDate: {
          lte: end,
          gte: start,
        },
      },
      include: {
        CheckpointTime: {
          select: {
            deadline: true,
            checkpoint: {
              select: {
                addressName: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });
    if (scanCheckpointsToday.length === 0) {
      const check = driverJoinCampaign.campaign.route.checkpointTime;
      for (let i = 0; i < check.length; i++) {
        await this.prisma.driverScanQRCode.create({
          data: {
            checkpointTimeId: check[i].id,
            driverJoinCampaignId: driverJoinCampaign.id,
            createDate: globalDate,
          },
        });
      }
      scanCheckpointsToday = await this.prisma.driverScanQRCode.findMany({
        where: {
          driverJoinCampaignId: driverJoinCampaign.id,
          createDate: {
            lte: end,
            gte: start,
          },
        },
        include: {
          CheckpointTime: {
            select: {
              deadline: true,
              checkpoint: {
                select: {
                  addressName: true,
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
        },
      });
    }
    scanCheckpointsToday.sort(
      (c1, c2) =>
        Number(c1.CheckpointTime.deadline.split(':')[0]) -
        Number(c2.CheckpointTime.deadline.split(':')[0]),
    );

    return scanCheckpointsToday.map((s, index) => {
      return {
        ...s,
        CheckpointTime: {
          ...s.CheckpointTime,
          deadline:
            index === 0
              ? `7:00 - ${s.CheckpointTime.deadline}`
              : `${scanCheckpointsToday[index - 1].CheckpointTime.deadline} - ${
                  s.CheckpointTime.deadline
                }`,
        },
      };
    });
  }
}
