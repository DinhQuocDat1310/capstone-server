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
import { EmailsService } from 'src/email/service';

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
    private readonly emailService: EmailsService,

    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async handleCompleteRegisterCampaignPhase(globalDate?: string) {
    const campaigns =
      await this.campaignsService.getAllCampaignRegisterIsExpired(globalDate);
    if (campaigns.length === 0) {
      this.logger.debug('No campaigns is end register phase today');
      return;
    }
    for (let i = 0; i < campaigns.length; i++) {
      let content = ``;
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
        await this.paymentService.updatePaymentPrePayForCampaign(
          campaigns[i].id,
        );
        content = `<p>Your campaign <b>${campaigns[i].campaignName}</b> is open for register successful. Your current campaign status is <b>PAYMENT</b>.</p></br>`;

        const listDriverJoin = campaigns[i].driverJoinCampaign.filter(
          (d) => d.status === 'APPROVE',
        );
        for (let j = 0; j < listDriverJoin.length; j++) {
          await this.emailService.sendNotificationViaEmail(
            listDriverJoin[j].driver.user.email,
            'Status campaign approved',
            `
            <h1 style="color: green">Dear ${listDriverJoin[j].driver.user.fullname}</h1></br>
            <p>Thanks for becoming Brandvertise's partner!</p>
            <p>This campaign: ${campaigns[i].campaignName}  you joined is open successful!. Brandvertise will respond for you as soon as possible</p>
            <p>Regards,</p>
            <p style="color: green">Brandvertise</p>
            `,
          );
        }
      } else {
        const messageDesc = 'OPEN: Lack of quantity driver';
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
        content = `<p>Your campaign <b>${campaigns[i].campaignName}</b> is open for register failure. Your current campaign status is <b>CANCEL</b>.</p></br>`;
        const listDriverJoin = campaigns[i].driverJoinCampaign.filter(
          (d) => d.status === 'APPROVE',
        );
        for (let j = 0; j < listDriverJoin.length; j++) {
          await this.emailService.sendNotificationViaEmail(
            listDriverJoin[j].driver.user.email,
            'Status campaign cancelled',
            `
            <h1 style="color: green">Dear ${listDriverJoin[j].driver.user.fullname}</h1></br>
            <p>Thanks for becoming Brandvertise's partner!</p>
            <p>This campaign: ${campaigns[i].campaignName} you joined is open failure!.</p> 
            <p>Regards,</p>
            <p style="color: green">Brandvertise</p>
            `,
          );
        }
      }
      const html = `
        <h1 style="color: green">Dear ${campaigns[i].brand.brandName}</h1></br>
        <p>Thanks for becoming Brandvertise's partner!</p>
        ${content}
        <p>Regards,</p>
        <p style="color: green">Brandvertise</p>
        `;
      await this.emailService.sendNotificationViaEmail(
        campaigns[i].brand.user.email,
        'Your status campaign changed!',
        html,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async handleCompletePrePaymentCampaignPhase(globalDate?: string) {
    const campaigns =
      await this.campaignsService.getAllCampaignPaymentIsExpired(
        true,
        globalDate,
      );
    if (campaigns.length === 0) {
      this.logger.debug('No campaigns is end prepay Payment phase today');
      return;
    }
    let content = '';
    for (let i = 0; i < campaigns.length; i++) {
      const payment = campaigns[i].paymentDebit.find(
        (pay) => pay.type === 'PREPAY',
      );
      if (payment.paidDate) {
        await this.campaignsService.updateStatusCampaign(
          campaigns[i].id,
          CampaignStatus.WRAPPING,
        );
        content = `<p>Your campaign <b>${campaigns[i].campaignName}</b> is checkout 20% successful. Your current campaign status is <b>WRAPPING</b>.</p></br>`;
        const listDriverJoin = campaigns[i].driverJoinCampaign.filter(
          (d) => d.status === 'APPROVE',
        );
        for (let j = 0; j < listDriverJoin.length; j++) {
          await this.emailService.sendNotificationViaEmail(
            listDriverJoin[j].driver.user.email,
            'Wrapping Phase',
            `
            <h1 style="color: green">Dear ${listDriverJoin[j].driver.user.fullname}</h1></br>
            <p>Thanks for becoming Brandvertise's partner!</p>
            <p>Please arrange your time from ${campaigns[i].startWrapDate} to ${campaigns[i].endWrapDate} at location ${campaigns[i].locationCampaign.addressPoint} to do the car stickers. Your campaign will be started running at ${campaigns[i].startRunningDate}.</p>
            <p>Regards,</p>
            <p style="color: green">Brandvertise</p>
            `,
          );
        }
      } else {
        await this.campaignsService.updateStatusCampaign(
          campaigns[i].id,
          CampaignStatus.CANCELED,
          `PAYMENT: This campaign is canceled because you dont purchase 20%!`,
        );
        content = `<p>Your campaign <b>${campaigns[i].campaignName}</b> is checkout 20% failure. Your current campaign status is <b>CANCELED</b>.</p></br>`;
        const listDriverJoin = campaigns[i].driverJoinCampaign.filter(
          (d) => d.status === 'APPROVE',
        );
        for (let j = 0; j < listDriverJoin.length; j++) {
          await this.emailService.sendNotificationViaEmail(
            listDriverJoin[j].driver.user.email,
            'Wrapping Phase',
            `
            <h1 style="color: green">Dear ${listDriverJoin[j].driver.user.fullname}</h1></br>
            <p>Thanks for becoming Brandvertise's partner!</p>
            <p>We sincerely apologize, the campaign you are participating in has been suspended. Sorry for any convenience</p>
            <p>Regards,</p>
            <p style="color: green">Brandvertise</p>
            `,
          );
        }
      }
      const html = `
        <h1 style="color: green">Dear ${campaigns[i].brand.brandName}</h1></br>
        <p>Thanks for becoming Brandvertise's partner!</p>
        ${content}
        <p>Regards,</p>
        <p style="color: green">Brandvertise</p>
        `;
      await this.emailService.sendNotificationViaEmail(
        campaigns[i].brand.user.email,
        'Your status campaign changed!',
        html,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async handleCompletePostPaymentCampaignPhase(globalDate?: string) {
    const campaigns =
      await this.campaignsService.getAllCampaignPaymentIsExpired(
        false,
        globalDate,
      );
    if (campaigns.length === 0) {
      this.logger.debug('No campaigns is end postpaid Payment phase today');
      return;
    }
    for (let i = 0; i < campaigns.length; i++) {
      const payment = campaigns[i].paymentDebit.find(
        (pay) => pay.type === 'POSTPAID',
      );
      if (payment.paidDate) {
        await this.campaignsService.updateStatusCampaign(
          campaigns[i].id,
          CampaignStatus.CLOSED,
        );
      } else {
        await this.campaignsService.updateStatusCampaign(
          campaigns[i].id,
          CampaignStatus.CANCELED,
          'FINISH: This campaign is canceled because you are not purchase 80%!!',
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async handleCompleteWrappingCampaignPhase(globalDate?: string) {
    const campaigns = await this.campaignsService.getAllCampaignWrapIsExpired(
      globalDate,
    );
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

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async handleCompleteRunningCampaignPhase(globalDate?: string) {
    try {
      const campaigns =
        await this.campaignsService.getAllCampaignRunningIsExpired(globalDate);
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
            'RUNNING: Your campaign will be completely free as we do not meet the minimum kilometers for the entire campaign, you will get your refund ASAP. We sincerely apologize, thank you for using the service.',
          );
          await this.driverService.updateAllStatusDriverJoinCampaign(
            campaigns[i].id,
            StatusDriverJoin.FINISH,
          );

          await this.emailService.sendNotificationViaEmail(
            campaigns[i].brand.user.email,
            'Your status campaign changed!',
            `
          <h1 style="color: green">Dear ${campaigns[i].brand.brandName}</h1></br>
          <p>Thanks for becoming Brandvertise's partner!</p>
          <p>Your campaign ${campaigns[i].campaignName} will be completely free as we do not meet the minimum kilometers for the entire campaign, you will get your refund ASAP. We sincerely apologize, thank you for using the service.</p>
          <p>Regards,</p>
          <p style="color: green">Brandvertise</p>
          `,
          );

          const listDriverJoin = campaigns[i].driverJoinCampaign.filter(
            (d) => d.status === 'APPROVE',
          );
          for (let j = 0; j < listDriverJoin.length; j++) {
            await this.emailService.sendNotificationViaEmail(
              listDriverJoin[j].driver.user.email,
              'Status campaign approved',
              `
              <h1 style="color: green">Dear ${listDriverJoin[j].driver.user.fullname}</h1></br>
              <p>Thanks for becoming Brandvertise's partner!</p>
              <p>This campaign: ${campaigns[i].campaignName}  you joined is closed!. Brandvertise will respond for you as soon as possible</p>
              <p>Regards,</p>
              <p style="color: green">Brandvertise</p>
              `,
            );
          }
          continue;
        }
        const prePay = campaigns[i].paymentDebit.find(
          (pay) => pay.type === 'PREPAY',
        );
        const postPaid = campaigns[i].paymentDebit.find(
          (pay) => pay.type === 'POSTPAID',
        );

        const isBothSide = campaigns[i].wrap.positionWrap === 'BOTH_SIDE';
        const extraWrapMoney = isBothSide ? 400000 : 200000;
        const priceWrap = Number(campaigns[i].wrapPrice);

        const time = Math.ceil(parseInt(campaigns[i].duration) / 30) - 1;

        const totalWrapMoney =
          (priceWrap + time * extraWrapMoney) * listDriverJoinCampaign.length;

        const totalDriverMoney =
          Number(campaigns[i].minimumKmDrive) *
          Number(campaigns[i].locationPricePerKm) *
          listDriverJoinCampaign.length *
          Number(campaigns[i].duration);

        //TODO: 100%
        if (totalMeterFinalReport / 1000 >= Number(campaigns[i].totalKm)) {
          const totalMoney =
            totalDriverMoney + totalWrapMoney + totalDriverMoney * 0.1;

          await this.prisma.paymentDebit.update({
            data: {
              price: `${Math.ceil(totalMoney - Number(prePay.price))}`,
            },
            where: {
              id: postPaid.id,
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

          await this.emailService.sendNotificationViaEmail(
            campaigns[i].brand.user.email,
            'Your status campaign changed!',
            `
          <h1 style="color: green">Dear ${campaigns[i].brand.brandName}</h1></br>
          <p>Thanks for becoming Brandvertise's partner!</p>
          <p>Your campaign ${campaigns[i].campaignName} is finished running phase. Please visit brandvertise's website to to view campaign report as well as finish the campaign run</p>
          <p>Regards,</p>
          <p style="color: green">Brandvertise</p>
          `,
          );

          const listDriverJoin = campaigns[i].driverJoinCampaign.filter(
            (d) => d.status === 'APPROVE',
          );
          for (let j = 0; j < listDriverJoin.length; j++) {
            await this.emailService.sendNotificationViaEmail(
              listDriverJoin[j].driver.user.email,
              'Status campaign approved',
              `
              <h1 style="color: green">Dear ${listDriverJoin[j].driver.user.fullname}</h1></br>
              <p>Thanks for becoming Brandvertise's partner!</p>
              <p>This campaign: ${campaigns[i].campaignName}  you joined is closed!. Brandvertise will respond for you as soon as possible</p>
              <p>Regards,</p>
              <p style="color: green">Brandvertise</p>
              `,
            );
          }
          continue;
        }

        // TODO:  >=80%
        const percentTotalKilometer =
          totalMeterFinalReport / 1000 / Number(campaigns[i].totalKm);
        const totalMoney =
          totalDriverMoney * percentTotalKilometer +
          totalWrapMoney +
          totalDriverMoney * 0.1 * percentTotalKilometer;

        await this.prisma.paymentDebit.update({
          data: {
            price: `${Math.ceil(totalMoney - Number(prePay.price))}`,
          },
          where: {
            id: postPaid.id,
          },
        });

        await this.campaignsService.updateStatusCampaign(
          campaigns[i].id,
          CampaignStatus.FINISH,
        );

        await this.driverService.updateAllStatusDriverJoinCampaign(
          campaigns[i].id,
          StatusDriverJoin.FINISH,
        );

        await this.emailService.sendNotificationViaEmail(
          campaigns[i].brand.user.email,
          'Your status campaign changed!',
          `
        <h1 style="color: green">Dear ${campaigns[i].brand.brandName}</h1></br>
        <p>Thanks for becoming Brandvertise's partner!</p>
        <p>Your campaign ${campaigns[i].campaignName} is finished running phase. Please visit brandvertise's website to to view campaign report as well as finish the campaign run</p>
        <p>Regards,</p>
        <p style="color: green">Brandvertise</p>
        `,
        );

        const listDriverJoin = campaigns[i].driverJoinCampaign.filter(
          (d) => d.status === 'APPROVE',
        );
        for (let j = 0; j < listDriverJoin.length; j++) {
          await this.emailService.sendNotificationViaEmail(
            listDriverJoin[j].driver.user.email,
            'Status campaign approved',
            `
            <h1 style="color: green">Dear ${listDriverJoin[j].driver.user.fullname}</h1></br>
            <p>Thanks for becoming Brandvertise's partner!</p>
            <p>This campaign: ${campaigns[i].campaignName}  you joined is closed!. Brandvertise will respond for you as soon as possible</p>
            <p>Regards,</p>
            <p style="color: green">Brandvertise</p>
            `,
          );
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
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
