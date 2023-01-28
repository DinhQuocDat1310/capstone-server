import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import { Cache } from 'cache-manager';
import {
  EXPIRED_GLOBAL_DATE_ONE_DAY,
  GLOBAL_DATE,
  OPTIONS_DATE,
} from 'src/constants/cache-code';
import { TasksService } from 'src/task/service';

@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly taskService: TasksService,
  ) {}

  async getListCampaigns() {
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        statusCampaign: {
          notIn: ['NEW', 'CLOSED'],
        },
      },
      include: {
        driverJoinCampaign: {
          include: {
            driverScanQRCode: true,
            drivingPhotoReport: true,
          },
        },
      },
    });

    return campaigns.map((campaign) => {
      return {
        ...campaign,
        startPaymentDate: new Date(
          campaign.startPaymentDate,
        ).toLocaleDateString('vn-VN', OPTIONS_DATE),
        startRegisterDate: new Date(
          campaign.startRegisterDate,
        ).toLocaleDateString('vn-VN', OPTIONS_DATE),
        startRunningDate: new Date(
          campaign.startRunningDate,
        ).toLocaleDateString('vn-VN', OPTIONS_DATE),
        startWrapDate: new Date(campaign.startWrapDate).toLocaleDateString(
          'vn-VN',
          OPTIONS_DATE,
        ),
        endPaymentDate: new Date(campaign.endPaymentDate).toLocaleDateString(
          'vn-VN',
          OPTIONS_DATE,
        ),
        endRegisterDate: new Date(campaign.endRegisterDate).toLocaleDateString(
          'vn-VN',
          OPTIONS_DATE,
        ),
        endWrapDate: new Date(campaign.endWrapDate).toLocaleDateString(
          'vn-VN',
          OPTIONS_DATE,
        ),
        numberOfDriversRequired: campaign?.quantityDriver,
        numberOfDriversJoined: campaign.driverJoinCampaign.filter(
          (driver) => driver.status === 'JOIN' || driver.status === 'APPROVE',
        ).length,
      };
    });
  }

  async getGlobalDate() {
    let date = await this.cacheManager.get(GLOBAL_DATE);
    if (!date) {
      date = await this.cacheManager.set(GLOBAL_DATE, new Date(), {
        ttl: EXPIRED_GLOBAL_DATE_ONE_DAY,
      });
    }
    return date;
  }

  async resetGlobalDate() {
    const today = new Date();
    await this.cacheManager.set(GLOBAL_DATE, today, {
      ttl: EXPIRED_GLOBAL_DATE_ONE_DAY,
    });
    return today;
  }

  async setGlobalDate(newDate: Date) {
    const globalDate: Date = await this.cacheManager.get(GLOBAL_DATE);
    if (globalDate?.getTime() > newDate.getTime()) {
      this.logger.error('New date must be greater than current global date');
      return;
    }

    await this.cacheManager.set(GLOBAL_DATE, newDate, {
      ttl: EXPIRED_GLOBAL_DATE_ONE_DAY,
    });

    await this.taskService.handleCompleteRegisterCampaignPhase(newDate);
    // await this.taskService.handleCompletePaymentCampaignPhase(newDate);
    await this.taskService.handleCompleteWrappingCampaignPhase(newDate);
    // await this.taskService.handleCompletePostPaymentCampaignPhase(
    //   newGlobalDate,
    // );
  }
}
