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
import fetch, { Response } from 'node-fetch';
// import { GLOBAL_DATE } from 'src/constants/cache-code';
import { PrismaService } from 'src/prisma/service';
import { TransactionDTO } from './dto';
import { StatusCampaign } from '@prisma/client';

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
      const walletUser = await this.prisma.eWallet.findFirst({
        where: {
          userId: dto.userId,
        },
      });
      const result = await this.handleResponse(response);
      await this.prisma.transactions.create({
        data: {
          id: result.id,
          amount: +dto.amount,
          createDate: new Date(),
          name: 'PAYPAL Service',
          status: 'PENDING',
          type: 'DEPOSIT',
          eWallet: {
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
    const walletUser = await this.prisma.eWallet.findFirst({
      where: {
        userId,
      },
    });
    const transactionUser = await this.prisma.transactions.findFirst({
      where: {
        id: orderId,
      },
    });

    if (response.status === 200 || response.status === 201) {
      try {
        const totalBalance =
          Number(walletUser.totalBalance) + Number(transactionUser.amount);
        await this.prisma.transactions.update({
          where: {
            id: transactionUser.id,
          },
          data: {
            status: 'SUCCESS',
          },
        });
        await this.prisma.eWallet.update({
          where: {
            id: walletUser.id,
          },
          data: {
            totalBalance: totalBalance,
          },
        });
        return response.json();
      } catch (error) {
        this.logger.error(error.message);
        throw new BadRequestException(error.message);
      }
    } else {
      await this.prisma.transactions.update({
        where: {
          id: walletUser.id,
        },
        data: {
          status: 'FAILED',
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

  async handleAllWebhook(dto: any) {
    this.logger.debug('Test Something webhook', dto);
  }

  async viewAllTransaction(userReq: UserSignIn) {
    return await this.prisma.eWallet.findMany({
      where: {
        userId: userReq.id,
      },
      select: {
        id: true,
        totalBalance: true,
        updateDate: true,
        transactions: {
          select: {
            name: true,
            amount: true,
            createDate: true,
            type: true,
            status: true,
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

      const walletUser = await this.prisma.eWallet.findFirst({
        where: {
          userId,
        },
      });

      await this.prisma.transactions.create({
        data: {
          amount: totalPay,
          createDate: new Date(),
          name: `Checkout campaign ${campaign.campaignName}`,
          status: 'SUCCESS',
          type: 'WITHDRAW',
          eWallet: {
            connect: {
              id: walletUser.id,
            },
          },
        },
      });

      const balance = Number(walletUser.totalBalance) - totalPay;
      await this.prisma.eWallet.update({
        where: {
          id: walletUser.id,
        },
        data: {
          totalBalance: balance,
        },
      });

      await this.prisma.campaign.update({
        where: {
          id: campaign.id,
        },
        data: {
          statusCampaign: StatusCampaign.WRAPPING,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
