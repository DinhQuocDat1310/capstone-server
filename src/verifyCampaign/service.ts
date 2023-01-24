import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  StatusCampaign,
  StatusVerifyAccount,
  StatusVerifyCampaign,
} from '@prisma/client';
import { Cache } from 'cache-manager';
import { AppConfigService } from 'src/config/appConfigService';
import { PrismaService } from 'src/prisma/service';
import { ManagerVerifyCampaignDTO } from './../manager/dto';

@Injectable()
export class VerifyCampaignService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly configService: AppConfigService,
  ) {}

  async getAllVerifyCampaignNew() {
    return await this.prisma.verifyCampaign.findMany({
      where: {
        status: 'NEW',
      },
      select: {
        id: true,
      },
    });
  }

  async getListVerifyCampaignPending(userId: string) {
    try {
      return await this.prisma.verifyCampaign.findMany({
        where: {
          manager: {
            userId,
          },
          status: StatusVerifyCampaign.PENDING,
        },
        select: {
          id: true,
          campaign: {
            select: {
              id: true,
              brandId: true,
              brand: {
                select: {
                  brandName: true,
                  logo: true,
                },
              },
              campaignName: true,
              startRunningDate: true,
            },
          },
        },
        orderBy: {
          createDate: 'asc',
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getListCurrentCampaignByManagerId(userId: string) {
    try {
      return await this.prisma.campaign.findMany({
        where: {
          AND: [
            {
              statusCampaign: {
                in: ['OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING'],
              },
            },
            {
              verifyCampaign: {
                every: {
                  status: {
                    in: ['ACCEPT'],
                  },
                },
              },
            },
            {
              verifyCampaign: {
                some: {
                  manager: {
                    userId,
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          campaignName: true,
          quantityDriver: true,
          startRunningDate: true,
          brand: {
            select: {
              brandName: true,
              logo: true,
            },
          },
          statusCampaign: true,
        },
        orderBy: {
          startRunningDate: 'asc',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async managerVerifyCampaign(userId: string, dto: ManagerVerifyCampaignDTO) {
    const verify = await this.prisma.verifyCampaign.findFirst({
      where: {
        AND: [
          { id: dto.verifyId },
          { status: StatusVerifyCampaign.PENDING },
          {
            manager: {
              userId: userId,
            },
          },
        ],
      },
      include: {
        campaign: {
          select: {
            id: true,
            campaignName: true,
          },
        },
      },
    });
    if (!verify) {
      throw new BadRequestException(
        'This request is not pending anymore. Can you try another request!',
      );
    }
    await this.prisma.verifyCampaign.update({
      where: {
        id: dto.verifyId,
      },
      data: {
        status: dto.action,
        detail: dto.detail,
      },
    });
    let status: StatusVerifyCampaign = StatusVerifyCampaign.PENDING;
    let statusCampaign: StatusCampaign = StatusCampaign.NEW;
    let message = '';
    switch (dto.action) {
      case 'BANNED':
        message = `<p>Your campaign has been banned for violating our terms</p>
           <p>Please contact ${this.configService.getConfig(
             'MAILER',
           )} for more information</p>`;
        status = StatusVerifyCampaign.BANNED;
        statusCampaign = StatusCampaign.CANCELED;
        break;
      case 'UPDATE':
        message = `<p>The campaign information you provided is not valid, please update so that Brandvertise's team can support as soon as possible.</p>
           <p>Please login at the website for more details</p>`;
        status = StatusVerifyCampaign.UPDATE;
        break;
    }
    const campaign = await this.prisma.campaign.update({
      where: {
        id: verify.campaignId,
      },
      data: {
        statusCampaign,
        detailMessage: dto.detail,
        verifyCampaign: {
          update: {
            data: {
              status,
            },
            where: {
              id: verify.id,
            },
          },
        },
      },
      select: {
        brand: {
          select: {
            brandName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    await this.mailerService.sendMail({
      to: campaign.brand.user.email,
      from: this.configService.getConfig('MAILER'),
      subject: `Result verification Campaign ${verify.campaign.campaignName}`,
      html: `
       <p>Dear ${campaign.brand.brandName},</p></br>
       <p>Thanks for becoming Brandvertise's partner!</p>
        ${message}
       <p>Regards,</p>
       <p style="color: green">Brandvertise</p>
    `,
    });
    return;
  }

  async getListHistoryVerifiedCampaignByManagerId(userId: string) {
    try {
      return await this.prisma.verifyCampaign.findMany({
        where: {
          manager: {
            userId,
          },
          status: {
            not: StatusVerifyCampaign.PENDING || StatusVerifyCampaign.NEW,
          },
        },
        select: {
          campaign: {
            select: {
              id: true,
              campaignName: true,
              duration: true,
              quantityDriver: true,
              brand: {
                select: {
                  brandName: true,
                  logo: true,
                },
              },
            },
          },
        },
        orderBy: {
          createDate: 'asc',
        },
        distinct: ['campaignId'],
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getHistoryDetailVerifiedCampaign(userId: string, id: string) {
    const select = {
      status: true,
      detail: true,
      createDate: true,
    };
    try {
      return await this.prisma.verifyCampaign.findMany({
        where: {
          AND: [
            {
              manager: {
                userId,
              },
            },
            {
              campaignId: id,
            },
            {
              status: {
                not: StatusVerifyAccount.PENDING || StatusVerifyAccount.NEW,
              },
            },
          ],
        },
        select,
        orderBy: {
          createDate: 'desc',
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async checkManagerContraistTaskCampaign(managerId: string) {
    const taskCampaigns = await this.prisma.verifyCampaign.findMany({
      where: {
        AND: [
          { managerId },
          {
            status: {
              in: ['PENDING', 'UPDATE'],
            },
          },
        ],
      },
      select: {
        id: true,
        status: true,
      },
    });
    const resultStatus = taskCampaigns.filter(
      (task) => task.status === 'UPDATE',
    );
    if (resultStatus.length !== 0) {
      throw new BadRequestException(
        `This Manager has ${resultStatus.length} task Campaign processing: UPDATE. Please wait manager end task for Disable`,
      );
    }
    return taskCampaigns.map((verify) => verify['id']);
  }

  async removeTaskCampaignOutOfManager(ids: string[]) {
    await this.prisma.verifyCampaign.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status: StatusVerifyCampaign.NEW,
        managerId: null,
      },
    });
  }

  async getTaskCampaign(managerId: string) {
    const taskCampaign = await this.prisma.verifyCampaign.findMany({
      where: {
        managerId,
      },
      select: {
        campaign: {
          select: {
            campaignName: true,
          },
        },
        status: true,
        detail: true,
        createDate: true,
      },
      orderBy: {
        createDate: 'asc',
      },
    });
    return taskCampaign
      .map((task) => task)
      .map((task) => {
        const time = task?.createDate;
        const name = task?.campaign?.campaignName;
        delete task?.campaign;
        delete task?.createDate;
        return {
          action: 'Verify Campaign',
          name,
          ...task,
          time,
        };
      })
      .filter((task) => Object.keys(task || {}).length !== 0);
  }

  async getAllTaskCampaignNew() {
    const taskCampaign = await this.prisma.verifyCampaign.findMany({
      where: {
        status: 'NEW',
      },
      select: {
        id: true,
        campaign: {
          select: {
            campaignName: true,
          },
        },
      },
      orderBy: {
        createDate: 'asc',
      },
    });
    return taskCampaign
      .map((task) => task)
      .map((task) => {
        const name = task?.campaign?.campaignName;
        delete task?.campaign;
        return {
          action: 'Verify Campaign',
          name,
          ...task,
        };
      })
      .filter((task) => Object.keys(task || {}).length !== 0);
  }
}
