import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import fetch, { Response } from 'node-fetch';
import { PrismaService } from 'src/prisma/service';
import * as fs from 'fs';
import * as moment from 'moment';
import { TypePayment } from '@prisma/client';
import { TransactionCampaignDTO } from './dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: TransactionCampaignDTO) {
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id: dto.campaignId,
        statusCampaign: 'PAYMENT',
      },
      include: {
        contractCampaign: true,
        paymentDebit: true,
      },
    });
    if (!campaign)
      throw new BadRequestException('Please input correct campaign ID');

    if (!campaign.contractCampaign)
      throw new BadRequestException('Your campaign is not create contract yet');

    try {
      const totalMoney = Number(
        campaign.paymentDebit.find((pay) => pay.type === dto.typePayment)
          ?.price,
      );

      const accessToken = await this.generateAccessToken();
      const url = `${process.env.BASE}/v2/checkout/orders`;
      const response = await fetch(url, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: (totalMoney / 24500).toFixed(0),
              },
            },
          ],
        }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async capturePostpaidTransaction(orderId: string, campaignId: string) {
    const accessToken = await this.generateAccessToken();
    const url = `${process.env.BASE}/v2/checkout/orders/${orderId}/capture/${campaignId}`;
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200 || response.status === 201) {
      try {
        const postPaid = await this.prisma.paymentDebit.findFirst({
          where: {
            campaignId,
            type: 'POSTPAID',
          },
        });
        await this.prisma.paymentDebit.update({
          where: {
            id: postPaid.id,
          },
          data: {
            paidDate: new Date(),
          },
        });
        await this.prisma.campaign.update({
          where: {
            id: campaignId,
          },
          data: {
            statusCampaign: 'CLOSED',
          },
        });
        return response.json();
      } catch (error) {}
    }

    const errorMessage = await response.text();
    throw new BadRequestException(errorMessage);
  }

  async capturePrepayTransaction(orderId: string, campaignId: string) {
    const accessToken = await this.generateAccessToken();
    const url = `${process.env.BASE}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200 || response.status === 201) {
      try {
        const prePay = await this.prisma.paymentDebit.findFirst({
          where: {
            campaignId,
            type: 'PREPAY',
          },
        });
        await this.prisma.paymentDebit.update({
          where: {
            id: prePay.id,
          },
          data: {
            paidDate: new Date(),
          },
        });
        await this.prisma.campaign.update({
          where: {
            id: campaignId,
          },
          data: {
            statusCampaign: 'WRAPPING',
          },
        });
        return response.json();
      } catch (error) {}
    }

    const errorMessage = await response.text();
    throw new BadRequestException(errorMessage);
  }

  private async generateAccessToken() {
    const auth = Buffer.from(
      process.env.CLIENT_ID + ':' + process.env.APP_SECRET,
    ).toString('base64');
    const response = await fetch(`${process.env.BASE}/v1/oauth2/token`, {
      method: 'post',
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    const jsonData = await this.handleResponse(response);
    return jsonData.access_token;
  }

  async handleResponse(response: Response): Promise<any> {
    if (response.status === 200 || response.status === 201) {
      return response.json();
    }

    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }

  async createPaymentPrePayForCampaign(campaignId: string) {
    const contract = await this.prisma.contractCampaign.findFirst({
      where: {
        campaignId,
      },
    });
    const objDataConfig = JSON.parse(
      fs.readFileSync('./dataConfig.json', 'utf-8'),
    );

    const gapDatePayment = Number(objDataConfig.gapDatePayment);
    const total =
      Number(contract.totalDriverMoney) +
      Number(contract.totalSystemMoney) +
      Number(contract.totalWrapMoney);

    await this.prisma.paymentDebit.create({
      data: {
        type: TypePayment.PREPAY,
        price: `${Number(total) * 0.2}`,
        expiredDate: moment(new Date(), 'MM-DD-YYYY')
          .add(gapDatePayment, 'days')
          .toISOString(),
        campaign: {
          connect: {
            id: campaignId,
          },
        },
      },
    });
  }

  // async createPaymentPostPaidForCampaign(campaignId: string) {

  //   const totalMoney =
  //     Number(contract.totalWrapMoney) +
  //     Number(contract.totalDriverMoney) +
  //     Number(contract.totalSystemMoney);

  //   const gapDatePayment = Number(objDataConfig.gapDatePayment);
  //   await this.prisma.paymentDebit.create({
  //     data: {
  //       type: TypePayment.PREPAY,
  //       price: `${totalMoney * 0.2}`,
  //       expiredDate: moment(new Date(), 'MM-DD-YYYY')
  //         .add(gapDatePayment, 'days')
  //         .toISOString(),
  //       campaign: {
  //         connect: {
  //           id: campaignId,
  //         },
  //       },
  //     },
  //   });
  // }

  async handleAllWebhook(dto: any) {
    this.logger.debug('Test Something webhook', dto);
  }
}
