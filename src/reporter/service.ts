import { CreateReportDriverCampaignDTO } from './dto';
import { UsersService } from 'src/user/service';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import { Cache } from 'cache-manager';
import { GLOBAL_DATE } from 'src/constants/cache-code';
import { TasksService } from 'src/task/service';
import { addDays, diffDates } from 'src/utilities';

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
}
