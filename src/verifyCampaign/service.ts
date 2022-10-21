import {
  FAKE_DURATION,
  FAKE_TOTALKM,
  FAKE_QUANTITY_DRIVER,
  FAKE_ADDRESS,
  FAKE_LOCATION_PRICE,
  FAKE_POSITION_WRAP,
  FAKE_LOGO,
  FAKE_PRICE_POSITION,
} from './../constants/fake-data';
import {
  CampaignStatus,
  Role,
  UserStatus,
  VerifyAccountStatus,
  VerifyCampaignStatus,
} from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AppConfigService } from 'src/config/appConfigService';
import { PrismaService } from 'src/prisma/service';
import { ManagerVerifyDTO } from 'src/manager/dto';

@Injectable()
export class VerifyCampaignService {
  constructor(
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
          status: VerifyCampaignStatus.PENDING,
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
              locationCampaign: {
                select: {
                  locationName: true,
                },
              },
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
                in: ['OPEN', 'PAYMENT', 'WARPPING', 'RUNNING'],
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
          locationCampaign: {
            select: {
              locationName: true,
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

  async fakeAutoCreateVerifyCampaignRequest() {
    const brand = await this.prisma.user.findMany({
      where: {
        status: UserStatus.VERIFIED,
        role: Role.BRAND,
      },
      select: {
        brand: {
          select: {
            id: true,
          },
        },
      },
    });

    if (brand.length === 0) {
      return 'Nothing Brand Verified';
    }
    for (let i = 0; i < brand.length; i++) {
      for (let j = 0; j < 5; j++) {
        const campaignId = await this.prisma.campaign.create({
          data: {
            campaignName:
              'Sunlight' +
              Math.floor(
                Math.random() * (Math.pow(5, 6) * 9.9 - Math.pow(5, 6) + 1) +
                  Math.pow(6, 6),
              ),
            startRunningDate: new Date(),
            duration: FAKE_DURATION[j],
            quantityDriver: FAKE_QUANTITY_DRIVER[j],
            totalKm: FAKE_TOTALKM[j],
            description: 'Decription ' + (j + 1),
            brand: {
              connect: {
                id: brand[i].brand.id,
              },
            },
            locationCampaign: {
              create: {
                locationName: FAKE_ADDRESS[j],
                price: FAKE_LOCATION_PRICE[j],
              },
            },
            wrap: {
              create: {
                positionWarp: FAKE_POSITION_WRAP[j],
                imagePoster: FAKE_LOGO[j],
                price: FAKE_PRICE_POSITION[j],
              },
            },
          },
          select: {
            id: true,
          },
        });
        await this.prisma.verifyCampaign.create({
          data: {
            campaign: {
              connect: {
                id: campaignId.id,
              },
            },
          },
        });
      }
    }
    return `Create ${brand.length * 5} request verify NEW campaigns`;
  }

  async managerVerifyCampaign(userId: string, dto: ManagerVerifyDTO) {
    const verify = await this.prisma.verifyCampaign.findFirst({
      where: {
        AND: [
          { id: dto.verifyId },
          { status: VerifyCampaignStatus.PENDING },
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
    let status: VerifyCampaignStatus = VerifyCampaignStatus.PENDING;
    let statusCampaign: CampaignStatus = CampaignStatus.NEW;
    let message = '';
    switch (dto.action) {
      case 'BANNED':
        message = `<p>Your campaign has been banned for violating our terms</p>
           <p>Please contact ${this.configService.getConfig(
             'MAILER',
           )} for more information</p>`;
        status = VerifyCampaignStatus.BANNED;
        statusCampaign = CampaignStatus.CANCELED;
        break;
      case 'UPDATE':
        message = `<p>The campaign information you provided is not valid, please update so that Brandvertise's team can support as soon as possible.</p>
           <p>Please login at the website for more details</p>`;
        status = VerifyCampaignStatus.UPDATE;
        break;
    }
    const campaign = await this.prisma.campaign.update({
      where: {
        id: verify.campaignId,
      },
      data: {
        statusCampaign,
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
            not: VerifyCampaignStatus.PENDING || VerifyCampaignStatus.NEW,
          },
        },
        select: {
          campaign: {
            select: {
              id: true,
              campaignName: true,
              duration: true,
              quantityDriver: true,
              totalKm: true,
              brand: {
                select: {
                  brandName: true,
                  logo: true,
                },
              },
              locationCampaign: {
                select: {
                  locationName: true,
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
      updateAt: true,
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
                not: VerifyAccountStatus.PENDING || VerifyAccountStatus.NEW,
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
        status: VerifyCampaignStatus.NEW,
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
        updateAt: true,
      },
      orderBy: {
        createDate: 'asc',
      },
    });
    return taskCampaign
      .map((task) => task)
      .map((task) => {
        let time = null;
        const name = task?.campaign?.campaignName;
        delete task?.campaign;
        task?.status === 'PENDING'
          ? (time = task?.createDate)
          : (time = task?.updateAt);
        delete task?.createDate;
        delete task?.updateAt;
        return {
          action: 'Verify Campaign',
          name,
          ...task,
          time,
        };
      })
      .filter((task) => Object.keys(task || {}).length !== 0);
  }
}
