import { UserSignIn } from './../auth/dto/index';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import fetch, { Response } from 'node-fetch';
// import { GLOBAL_DATE } from 'src/constants/cache-code';
import { PrismaService } from 'src/prisma/service';
import { TransactionDTO } from './dto';
import { CampaignStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async createOrder(dto: TransactionDTO) {
    try {
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
                value: (+dto.amount / 24500).toFixed(0),
              },
            },
          ],
        }),
      });
      const walletUser = await this.prisma.iWallet.findFirst({
        where: {
          userId: dto.userId,
        },
      });
      const result = await this.handleResponse(response);
      await this.prisma.orderTransaction.create({
        data: {
          id: result.id,
          amount: dto.amount,
          createDate: moment(new Date(), 'MM/DD/YYYY')
            .toDate()
            .toLocaleDateString('vn-VN'),
          name: 'PAYPAL Service',
          statusOrder: 'PENDING',
          descriptionType: 'ADD_AMOUNT',
          iWallet: {
            connect: {
              id: walletUser.id,
            },
          },
        },
      });
      return result;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async captureTransaction(orderId: string, userId: string) {
    // const globalDate = await this.cacheManager.get(GLOBAL_DATE);
    const accessToken = await this.generateAccessToken();
    const url = `${process.env.BASE}/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const walletUser = await this.prisma.iWallet.findFirst({
      where: {
        userId,
      },
    });
    const transactionUser = await this.prisma.orderTransaction.findFirst({
      where: {
        id: orderId,
      },
    });

    if (response.status === 200 || response.status === 201) {
      try {
        const totalAmount =
          Number(walletUser.totalAmount) + Number(transactionUser.amount);
        await this.prisma.orderTransaction.update({
          where: {
            id: transactionUser.id,
          },
          data: {
            statusOrder: 'SUCCESS',
          },
        });
        await this.prisma.iWallet.update({
          where: {
            id: walletUser.id,
          },
          data: {
            totalAmount: totalAmount.toString(),
          },
        });
        return response.json();
      } catch (error) {
        this.logger.error(error.message);
        throw new BadRequestException(error.message);
      }
    } else {
      await this.prisma.orderTransaction.update({
        where: {
          id: walletUser.id,
        },
        data: {
          statusOrder: 'FAILED',
        },
      });
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

  async updatePaymentForCampaign(campaignId: string) {
    const contract = await this.prisma.contractCampaign.findFirst({
      where: {
        campaignId,
      },
      select: {
        campaign: {
          include: {
            paymentDebit: {
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
        status: 'APPROVE',
      },
    });

    const isBothSide = contract.campaign.wrap.positionWrap === 'BOTH_SIDE';
    const extraWrapMoney = isBothSide ? 400000 : 200000;
    const priceWrap = parseFloat(contract.campaign.wrapPrice);
    const time = Math.ceil(Number(contract.campaign.duration) / 30) - 1;

    const totalWrapMoney =
      (priceWrap + time * extraWrapMoney) * numberJoinCampaign;
    const totalDriverMoney =
      parseFloat(contract.campaign.minimumKmDrive) *
      parseFloat(contract.campaign.locationPricePerKm) *
      numberJoinCampaign *
      parseFloat(contract.campaign.duration);

    const totalSystemMoney = totalDriverMoney * 0.1;

    const totalMoney = totalDriverMoney + totalWrapMoney + totalSystemMoney;

    await this.prisma.paymentDebit.update({
      where: {
        id: contract.campaign.paymentDebit.id,
      },
      data: {
        price: `${Math.ceil(totalMoney * 0.2)}`,
      },
    });
  }

  async handleAllWebhook(dto: any) {
    this.logger.debug('Test Something webhook', dto);
  }

  async viewAllTransaction(userReq: UserSignIn) {
    return await this.prisma.iWallet.findMany({
      where: {
        userId: userReq.id,
      },
      select: {
        id: true,
        totalAmount: true,
        updateDate: true,
        orderTransaction: {
          select: {
            name: true,
            amount: true,
            createDate: true,
            descriptionType: true,
            statusOrder: true,
          },
        },
      },
    });
  }

  async checkoutCampaign(userId: string, campaignId: string) {
    try {
      const campaign = await this.prisma.campaign.findFirst({
        where: {
          id: campaignId,
          brand: {
            userId,
          },
        },
        include: {
          contractCampaign: true,
        },
      });
      if (!campaign) throw new BadRequestException('Not found campaign');
      const totalPay =
        Number(campaign.contractCampaign.totalDriverMoney) +
        Number(campaign.contractCampaign.totalSystemMoney) +
        Number(campaign.contractCampaign.totalWrapMoney);

      const walletUser = await this.prisma.iWallet.findFirst({
        where: {
          userId,
        },
      });

      await this.prisma.orderTransaction.create({
        data: {
          amount: totalPay.toString(),
          createDate: moment(new Date(), 'MM/DD/YYYY')
            .toDate()
            .toLocaleDateString('vn-VN'),
          name: `Checkout campaign ${campaign.campaignName}`,
          statusOrder: 'SUCCESS',
          descriptionType: 'WITHDRAW_AMOUNT',
          iWallet: {
            connect: {
              id: walletUser.id,
            },
          },
        },
      });

      const balance = Number(walletUser.totalAmount) - totalPay;
      await this.prisma.iWallet.update({
        where: {
          id: walletUser.id,
        },
        data: {
          totalAmount: balance.toString(),
        },
      });

      await this.prisma.campaign.update({
        where: {
          id: campaign.id,
        },
        data: {
          statusCampaign: CampaignStatus.WRAPPING,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
