import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';
import fetch, { Response } from 'node-fetch';
import { PrismaService } from 'src/prisma/service';
import { TransactionCampaignDTO } from './dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: TransactionCampaignDTO) {
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id: dto.campaignId,
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

    if (
      campaign.statusCampaign !== 'PAYMENT' &&
      campaign.statusCampaign !== 'FINISH'
    ) {
      throw new BadRequestException('You cannot create payment this campaign');
    }

    try {
      const totalMoney =
        campaign.statusCampaign === 'PAYMENT'
          ? Number(
              campaign.paymentDebit.find((pay) => pay.type === 'PREPAY')?.price,
            )
          : Number(
              campaign.paymentDebit.find((pay) => pay.type === 'POSTPAID')
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

  async captureTransaction(orderId: string, campaignId: string) {
    const accessToken = await this.generateAccessToken();
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id: campaignId,
      },
      include: {
        contractCampaign: true,
        paymentDebit: true,
      },
    });
    if (!campaign)
      throw new BadRequestException('Please input correct campaign ID');

    if (
      campaign.statusCampaign !== 'PAYMENT' &&
      campaign.statusCampaign !== 'FINISH'
    ) {
      throw new BadRequestException('You cannot checkout this campaign');
    }

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
        const isPaymentCampaignStatus = campaign.statusCampaign === 'PAYMENT';
        const typePayment = campaign.paymentDebit.find(
          (payment) =>
            payment.type === (isPaymentCampaignStatus ? 'PREPAY' : 'POSTPAID'),
        );

        await this.prisma.paymentDebit.update({
          where: {
            id: typePayment.id,
          },
          data: {
            paidDate: moment().toDate().toLocaleDateString('vn-VN'),
          },
        });

        await this.prisma.campaign.update({
          where: {
            id: campaignId,
          },
          data: {
            statusCampaign: isPaymentCampaignStatus ? 'WRAPPING' : 'CLOSED',
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

  async updatePaymentPrePayForCampaign(campaignId: string) {
    const contract = await this.prisma.contractCampaign.findFirst({
      where: {
        campaignId,
      },
      select: {
        campaign: {
          include: {
            paymentDebit: {
              where: {
                type: 'PREPAY',
              },
              select: {
                id: true,
              },
            },
            wrap: true,
            locationCampaign: true,
          },
        },
      },
    });

    const numberJoinCampaign = await this.prisma.driverJoinCampaign.count({
      where: {
        campaignId,
      },
    });

    const isBothSide = contract.campaign.wrap.positionWrap === 'BOTH_SIDE';
    const extraWrapMoney = isBothSide ? 400000 : 200000;
    const priceWrap = parseFloat(contract.campaign.wrapPrice);
    const time = parseInt(contract.campaign.duration) / 30 - 1;
    const totalWrapMoney =
      (priceWrap + time * extraWrapMoney) * numberJoinCampaign;

    const totalDriverMoney =
      parseFloat(contract.campaign.minimumKmDrive) *
      parseFloat(contract.campaign.locationPricePerKm) *
      numberJoinCampaign *
      parseFloat(contract.campaign.duration);

    const totalMoney =
      totalDriverMoney + totalWrapMoney + totalDriverMoney * 0.1;
    const totalDeposit = totalMoney * 0.2;

    await this.prisma.paymentDebit.update({
      where: {
        id: contract.campaign.paymentDebit[0].id,
      },
      data: {
        price: totalDeposit.toString(),
      },
    });
  }

  async handleAllWebhook(dto: any) {
    this.logger.debug('Test Something webhook', dto);
  }
}
