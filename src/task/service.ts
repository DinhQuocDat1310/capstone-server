import { PrismaService } from 'src/prisma/service';
import { VerifyCampaignService } from './../verifyCampaign/service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ManagerService } from 'src/manager/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { CampaignService } from 'src/campaign/service';
import { CampaignStatus, StatusDriverJoin } from '@prisma/client';
import { PaymentService } from 'src/payment/service';
import { DriversService } from 'src/driver/service';
import * as moment from 'moment';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly managerService: ManagerService,
    private readonly verifyCampaignService: VerifyCampaignService,
    private readonly campaignsService: CampaignService,
    private readonly paymentService: PaymentService,
    private readonly driverService: DriversService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_11PM)
  async handleCompleteRegisterCampaignPhase() {
    const campaigns =
      await this.campaignsService.getAllCampaignRegisterIsExpired();
    if (campaigns.length === 0) {
      this.logger.debug('No campaigns is end register phase today');
      return;
    }
    for (let i = 0; i < campaigns.length; i++) {
      const amountDriverJoin =
        await this.campaignsService.getAmountDriverJoinCampaignTask(
          campaigns[i].id,
        );
      if (amountDriverJoin >= Number(campaigns[i].quantityDriver) * 0.8) {
        await this.campaignsService.updateStatusCampaign(
          campaigns[i].id,
          CampaignStatus.PAYMENT,
        );
        await this.driverService.updateAllStatusDriverJoinCampaign(
          campaigns[i].id,
          StatusDriverJoin.APPROVE,
        );
        await this.paymentService.createPaymentPrePayForCampaign(
          campaigns[i].id,
        );
      } else {
        const messageDesc = 'lack of quantity driver';
        await this.campaignsService.updateStatusCampaign(
          campaigns[i].id,
          CampaignStatus.CANCELED,
          messageDesc,
        );
        await this.driverService.updateAllStatusDriverJoinCampaign(
          campaigns[i].id,
          StatusDriverJoin.CANCEL,
          messageDesc,
        );
      }
    }
  }

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_11PM)
  async handleCompleteWrappingCampaignPhase() {
    const campaigns = await this.campaignsService.getAllCampaignWrapIsExpired();
    if (campaigns.length === 0) {
      this.logger.debug('No campaigns is end wrapping phase today');
      return;
    }
    for (let i = 0; i < campaigns.length; i++) {
      await this.campaignsService.updateStatusCampaign(
        campaigns[i].id,
        CampaignStatus.RUNNING,
      );
    }
  }

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_11PM)
  async handleCompleteRunningCampaignPhase() {
    try {
      const campaigns =
        await this.campaignsService.getAllCampaignRunningIsExpired();
      if (campaigns.length === 0) {
        this.logger.debug('No campaigns is end running phase today');
        return;
      }

      for (let i = 0; i < campaigns.length; i++) {
        const listDriverJoinCampaign = campaigns[i].driverJoinCampaign.filter(
          (driver) => driver.status === 'APPROVE',
        );
        let totalMeterFinalReport = 0;

        listDriverJoinCampaign.forEach((driver) =>
          driver.driverTrackingLocation.forEach((track) =>
            track.tracking.forEach(
              (total) =>
                (totalMeterFinalReport += Number(total.totalMeterDriven)),
            ),
          ),
        );

        if (totalMeterFinalReport / 1000 < Number(campaigns[i].totalKm) * 0.8) {
          await this.campaignsService.updateStatusCampaign(
            campaigns[i].id,
            CampaignStatus.CANCELED,
            'Your campaign will be completely free as we do not meet the minimum kilometers for the entire campaign, you will get your refund ASAP. We sincerely apologize, thank you for using the service.',
          );
          await this.driverService.updateAllStatusDriverJoinCampaign(
            campaigns[i].id,
            StatusDriverJoin.FINISH,
          );
          return;
        }
        const prePay = campaigns[i].paymentDebit.find(
          (pay) => pay.type === 'PREPAY',
        );

        const totalMoney =
          Number(campaigns[i].contractCampaign.totalDriverMoney) +
          Number(campaigns[i].contractCampaign.totalSystemMoney) +
          Number(campaigns[i].contractCampaign.totalWrapMoney);

        const isBothSide = campaigns[i].wrap.positionWrap === 'BOTH_SIDE';
        const extraWrapMoney = isBothSide ? 400000 : 200000;
        const priceWrap = parseFloat(campaigns[i].wrapPrice);
        const amountDriverCancel =
          Number(campaigns[i].quantityDriver) - listDriverJoinCampaign.length;
        const time = parseInt(campaigns[i].duration) / 30 - 1;
        const totalWrapMoney =
          (priceWrap + time * extraWrapMoney) * amountDriverCancel;

        if (totalMeterFinalReport / 1000 >= Number(campaigns[i].totalKm)) {
          const postPaid = totalMoney - Number(prePay.price) - totalWrapMoney;
          await this.prisma.paymentDebit.create({
            data: {
              price: `${postPaid}`,
              type: 'POSTPAID',
              expiredDate: moment().add(5, 'days').toISOString(),
              campaign: {
                connect: {
                  id: campaigns[i].id,
                },
              },
            },
          });

          await this.campaignsService.updateStatusCampaign(
            campaigns[i].id,
            CampaignStatus.FINISH,
            'Your campaign was finished. please check out 80%',
          );

          await this.driverService.updateAllStatusDriverJoinCampaign(
            campaigns[i].id,
            StatusDriverJoin.FINISH,
          );

          return;
        }

        const postPaid = totalMoney - Number(prePay.price) - totalWrapMoney;

        await this.prisma.paymentDebit.create({
          data: {
            price: `${postPaid}`,
            type: 'POSTPAID',
            expiredDate: moment().add(5, 'days').toISOString(),
            campaign: {
              connect: {
                id: campaigns[i].id,
              },
            },
          },
        });

        await this.campaignsService.updateStatusCampaign(
          campaigns[i].id,
          CampaignStatus.FINISH,
          'Your campaign was finished. please check out 80%',
        );

        await this.driverService.updateAllStatusDriverJoinCampaign(
          campaigns[i].id,
          StatusDriverJoin.FINISH,
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_11PM)
  async handleAddManagerVerifyAccountData() {
    try {
      //Add mananger verify Account
      const HANDLE_REQUEST_IN_A_DAY = 5;
      const verifiesAccount = await this.verifyAccountService.getAllVerifyNew();
      const managers = await this.managerService.getManagers();
      if (verifiesAccount.length === 0) {
        this.logger.debug(
          `We don't have any request verify account to assign to manager (ACCOUNT)`,
        );
        return;
      }
      if (verifiesAccount.length < managers.length) {
        this.logger.debug(
          'Too less request verify account to assign for manager (ACCOUNT)',
        );
        return;
      }
      const ratioAccount =
        verifiesAccount.length / (managers.length * HANDLE_REQUEST_IN_A_DAY);

      const requestsHandlerAccountPerDay =
        ratioAccount >= 1
          ? HANDLE_REQUEST_IN_A_DAY
          : Math.floor(verifiesAccount.length / managers.length);

      for (let i = 0; i < managers.length; i++) {
        const arr = verifiesAccount.splice(0, requestsHandlerAccountPerDay);
        if (arr.length !== 0)
          await this.managerService.connectVerifyAccountsToManager(
            arr,
            managers[i].id,
          );
      }
      this.logger.debug(
        `Assign successful ${requestsHandlerAccountPerDay} request verify account for each Manager (ACCOUNT)`,
      );
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAddManagerVerifyCampaignData() {
    try {
      //Add mananger verify Campaign
      const HANDLE_REQUEST_IN_A_DAY = 5;
      const managers = await this.managerService.getManagers();
      const verifiesCampaign =
        await this.verifyCampaignService.getAllVerifyCampaignNew();

      if (verifiesCampaign.length === 0) {
        this.logger.debug(
          `We don't have any request verify campaign to assign to manager (CAMPAIGN)`,
        );
        return;
      }
      if (verifiesCampaign.length < managers.length) {
        this.logger.debug(
          'Too less request verify campaign to assign for manager (CAMPAIGN)',
        );
        return;
      }
      const ratioCampaign =
        verifiesCampaign.length / (managers.length * HANDLE_REQUEST_IN_A_DAY);

      const requestsHandlerCampaignPerDay =
        ratioCampaign >= 1
          ? HANDLE_REQUEST_IN_A_DAY
          : Math.floor(verifiesCampaign.length / managers.length);

      for (let i = 0; i < managers.length; i++) {
        const arr = verifiesCampaign.splice(0, requestsHandlerCampaignPerDay);
        if (arr.length !== 0)
          await this.managerService.connectVerifyCampaignToManager(
            arr,
            managers[i].id,
          );
      }
      this.logger.debug(
        `Assign successful ${requestsHandlerCampaignPerDay} request verify campaign for each Manager (CAMPAIGN)`,
      );
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
