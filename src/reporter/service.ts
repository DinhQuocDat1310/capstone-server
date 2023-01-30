import { CreateReportDriverCampaignDTO } from './dto';
import { UsersService } from 'src/user/service';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import { Cache } from 'cache-manager';
import { GLOBAL_DATE, GLOBAL_HOUR } from 'src/constants/cache-code';
import { TasksService } from 'src/task/service';
import { addDays, diffDates } from 'src/utilities';
import { Role } from '@prisma/client';

@Injectable()
export class ReporterService {
  private readonly logger = new Logger(ReporterService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
  ) {}
  async getListReporter() {
    const listReporters = await this.usersService.getListReporters();
    if (listReporters.length === 0) {
      throw new BadRequestException('Not found any Reporter');
    }
    return listReporters;
  }
  async getListReporterAvailable() {
    const users = await this.prisma.user.findMany({
      where: {
        role: Role.REPORTER,
      },
      select: {
        reporter: {
          select: {
            id: true,
            Checkpoint: {
              select: {
                addressName: true,
              },
            },
          },
        },
        fullname: true,
        email: true,
        status: true,
        isActive: true,
        address: true,
      },
    });
    const result = users
      .filter((u) => !u.reporter?.Checkpoint)
      .map((user) => {
        const reporterId = user?.reporter?.id;
        const address = user?.reporter?.Checkpoint?.addressName;
        delete user?.reporter;
        return {
          ...user,
          reporterId,
          address,
        };
      });

    if (result.length === 0)
      throw new BadRequestException(
        'We dont have any reporter available to assign to new checkpoint',
      );
    return result;
  }

  async getListCampaignInReporterLocation(reporterId: string) {
    const checkReporterId = await this.prisma.reporter.findFirst({
      where: {
        id: reporterId,
      },
    });
    if (!checkReporterId) throw new BadRequestException('Not found reporterId');
    const getLocationReporter = await this.prisma.reporter.findFirst({
      where: {
        id: reporterId,
      },
      select: {
        user: {
          select: {
            address: true,
          },
        },
      },
    });

    const resultCampaign = await this.prisma.campaign.findMany({
      where: {
        statusCampaign: {
          in: ['OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING', 'CLOSED'],
        },
      },
      select: {
        id: true,
        campaignName: true,
        startRunningDate: true,
        duration: true,
        quantityDriver: true,
        statusCampaign: true,
      },
    });
    for (let i = 0; i < resultCampaign.length; i++) {
      const countDriver = await this.prisma.driverJoinCampaign.count({
        where: {
          campaignId: resultCampaign[i].id,
        },
      });
      const dateEndCampaign = addDays(
        resultCampaign[i].startRunningDate,
        resultCampaign[i].duration - 1,
      );

      resultCampaign[i]['endDateCampaign'] = dateEndCampaign;
      resultCampaign[i]['quantityDriverJoinning'] = countDriver;
    }
    return resultCampaign;
  }

  async getDriverDetailByCarId(carId: string, userId: string) {
    return 'this getDriverDetailByCarId need to be update';
  }

  async createReporterDriverCampaign(
    dto: CreateReportDriverCampaignDTO,
    userId: string,
  ) {
    const globalDate: Date = await this.cacheManager.get(GLOBAL_DATE);
    const campaign = await this.prisma.driverJoinCampaign.findFirst({
      where: {
        id: dto.driverJoinCampaignId,
        campaign: {
          statusCampaign: 'RUNNING',
        },
      },
    });

    if (!campaign)
      throw new BadRequestException(
        'this campaign is finished already or not exist!',
      );

    const reporter = await this.prisma.reporter.findFirst({
      where: {
        userId,
      },
      select: {
        id: true,
        user: {
          select: {
            address: true,
          },
        },
      },
    });

    const dataDriverReport = await this.prisma.drivingPhotoReport.findMany({
      where: {
        driverJoinCampaignId: dto.driverJoinCampaignId,
        reporter: {
          user: {
            address: reporter.user.address,
          },
        },
        driverJoinCampaign: {
          campaign: {
            statusCampaign: 'RUNNING',
          },
        },
      },
      select: {
        reporterId: true,
        createDate: true,
        driverJoinCampaign: {
          select: {
            driver: {
              select: {
                licensePlates: true,
              },
            },
          },
        },
      },
    });
    dataDriverReport.sort(
      (a, b) => b.createDate.valueOf() - a.createDate.valueOf(),
    );
    if (dataDriverReport.length !== 0) {
      const differDateCheck = diffDates(
        globalDate,
        dataDriverReport[0].createDate,
      );
      if (Math.abs(differDateCheck) === 0) {
        throw new BadRequestException('Today is checked for this driver');
      }
    }

    await this.prisma.drivingPhotoReport.create({
      data: {
        imageCarBack: dto.imageCarBack,
        imageCarLeft: dto.imageCarLeft,
        imageCarRight: dto.imageCarRight,
        driverJoinCampaignId: dto.driverJoinCampaignId,
        reporterId: reporter.id,
        createDate: globalDate,
      },
    });

    // TODO: handle close if the last driver is reported just for demo.
    const campaignDriverJoin = await this.prisma.driverJoinCampaign.findFirst({
      where: {
        id: dto.driverJoinCampaignId,
      },
      include: {
        campaign: {
          include: {
            driverJoinCampaign: true,
          },
        },
      },
    });
    if (
      diffDates(
        globalDate,
        addDays(
          campaignDriverJoin.campaign.startRunningDate,
          campaignDriverJoin.campaign.duration - 1,
        ),
      ) === 0
    ) {
      const reports = await this.prisma.drivingPhotoReport.findMany({
        where: {
          driverJoinCampaign: {
            campaignId: campaignDriverJoin.campaignId,
          },
          createDate: globalDate,
        },
      });
      this.logger.debug(reports.length);

      if (
        reports.length ===
        campaignDriverJoin.campaign.driverJoinCampaign.filter(
          (driver) => driver.status === 'APPROVE',
        ).length
      ) {
        const newGlobalDate = globalDate;

        await this.tasksService.handleCompleteRunningCampaignPhase(
          newGlobalDate,
        );
      }
    }
    return 'Checked success';
  }

  async scanQRCodeDriver(userId: string, scanQRId: string) {
    try {
      const globalDate: Date = new Date(
        await this.cacheManager.get(GLOBAL_DATE),
      );
      const start = new Date(globalDate);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(globalDate);
      end.setUTCHours(23, 59, 59, 999);

      const globalHour: string = await this.cacheManager.get(GLOBAL_HOUR);

      const qrCode = await this.prisma.driverScanQRCode.findFirst({
        where: {
          id: scanQRId,
          createDate: {
            lte: end,
            gte: start,
          },
          CheckpointTime: {
            checkpoint: {
              reporter: {
                userId,
              },
            },
          },
        },
        include: {
          CheckpointTime: true,
        },
      });
      if (!qrCode)
        throw new BadRequestException(
          'You dont have permission to verify this checkpoint',
        );
      const listCheckpoint = await this.prisma.driverScanQRCode.findMany({
        where: {
          driverJoinCampaignId: qrCode.driverJoinCampaignId,
          createDate: {
            lte: end,
            gte: start,
          },
        },
        include: {
          CheckpointTime: {
            include: {
              checkpoint: true,
            },
          },
        },
      });

      listCheckpoint.sort(
        (c1, c2) =>
          Number(c1.CheckpointTime.deadline.split(':')[0]) -
          Number(c2.CheckpointTime.deadline.split(':')[0]),
      );

      const checkpointIndex = listCheckpoint.findIndex(
        (c) => c.id === qrCode.id,
      );

      for (let i = 0; i < checkpointIndex; i++) {
        if (listCheckpoint[i].isCheck === false) {
          if (listCheckpoint[i].id !== qrCode.id) {
            throw new BadRequestException(
              `You need to check checkpoint ${listCheckpoint[i].CheckpointTime.checkpoint.addressName} first`,
            );
          }
        }
      }

      if (qrCode.isCheck && qrCode.submitTime)
        throw new BadRequestException('You already checked this checkpoint');

      const hourG = globalHour.split(':')[0];
      const hourQR = qrCode.CheckpointTime.deadline.split(':')[0];
      if (hourG > hourQR)
        throw new BadRequestException('This driver is overdue to check');

      await this.prisma.driverScanQRCode.update({
        where: {
          id: scanQRId,
        },
        data: {
          submitTime: globalDate,
          isCheck: true,
        },
      });

      return await this.prisma.driverJoinCampaign.findFirst({
        where: {
          id: qrCode.driverJoinCampaignId,
        },
        include: {
          driver: true,
          campaign: true,
        },
      });
    } catch (error) {
      this.logger.debug(error.message);
      throw new BadRequestException(error.message);
    }
  }
}
