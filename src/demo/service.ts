import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import { Cache } from 'cache-manager';
import {
  EXPIRED_GLOBAL_DATE_ONE_DAY,
  GLOBAL_DATE,
} from 'src/constants/cache-code';
import * as moment from 'moment';
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
        paymentDebit: true,
        driverJoinCampaign: {
          include: {
            driverTrackingLocation: {
              include: {
                tracking: true,
              },
            },
          },
        },
      },
    });

    return campaigns.map((campaign) => {
      let totalMeterFinalReport = 0;
      if (campaign.statusCampaign === 'RUNNING') {
        campaign.driverJoinCampaign.forEach((driver) =>
          driver.driverTrackingLocation.forEach((track) =>
            track.tracking.forEach(
              (total) =>
                (totalMeterFinalReport += Number(total.totalMeterDriven)),
            ),
          ),
        );
      }
      const prepay = campaign.paymentDebit.find((pay) => pay.type === 'PREPAY');
      const postpaid = campaign.paymentDebit.find(
        (pay) => pay.type === 'POSTPAID',
      );
      return {
        ...campaign,
        prepay,
        postpaid,
        numberOfDriversRequired: campaign?.quantityDriver,
        numberOfDriversJoined: campaign.driverJoinCampaign.filter(
          (driver) => driver.status === 'JOIN' || driver.status === 'APPROVE',
        ).length,
        totalKilometerRequired: campaign.totalKm,
        totalKilometerDriverRun: `${(totalMeterFinalReport / 1000).toFixed(2)}`,
      };
    });
  }

  async getGlobalDate() {
    let date = await this.cacheManager.get(GLOBAL_DATE);
    if (!date) {
      date = await this.cacheManager.set(
        GLOBAL_DATE,
        moment().toDate().toLocaleDateString('vn-VN'),
        {
          ttl: EXPIRED_GLOBAL_DATE_ONE_DAY,
        },
      );
    }
    return date;
  }

  async setGlobalDate(newDate: string) {
    const globalDate = await this.cacheManager.get(GLOBAL_DATE);
    if (moment(globalDate, 'MM/DD/YYYY') > moment(newDate, 'MM/DD/YYYY')) {
      this.logger.error('New date must be greater than current global date');
      return;
    }

    const newGlobalDate = moment(newDate, 'MM/DD/YYYY')
      .toDate()
      .toLocaleDateString('vn-VN');
    await this.cacheManager.set(GLOBAL_DATE, newGlobalDate, {
      ttl: EXPIRED_GLOBAL_DATE_ONE_DAY,
    });

    await this.taskService.handleCompleteRegisterCampaignPhase(newGlobalDate);
    await this.taskService.handleCompletePrePaymentCampaignPhase(newGlobalDate);
    await this.taskService.handleCompleteWrappingCampaignPhase(newGlobalDate);
    await this.taskService.handleCompletePostPaymentCampaignPhase(
      newGlobalDate,
    );
  }
}
