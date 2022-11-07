import { VerifyCampaignService } from './../verifyCampaign/service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ManagerService } from 'src/manager/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { CampaignService } from 'src/campaign/service';
import { CampaignStatus, StatusDriverJoin } from '@prisma/client';
import { PaymentService } from 'src/payment/service';
import { DriversService } from 'src/driver/service';

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
  ) {}

  @Cron('0 */1 * * * *')
  async handleCompleteRegisterCampaignPhase() {
    const campaigns = await this.campaignsService.getAllCampaignIsExpired();
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
    this.logger.debug(campaigns);
  }

  @Cron('0 */3 * * * *')
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

  @Cron('0 */3 * * * *')
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
