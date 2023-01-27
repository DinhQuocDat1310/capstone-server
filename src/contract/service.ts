import { CancelContractDTO } from './dto';
import { AppConfigService } from 'src/config/appConfigService';
import { MailerService } from '@nestjs-modules/mailer';
import { StatusVerifyCampaign } from '@prisma/client';
import { CampaignContractDTO } from './../campaign/dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import * as fs from 'fs';
import { addDays, diffDates } from 'src/utilities';

@Injectable()
export class ContractService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async createCampaignContract(dto: CampaignContractDTO) {
    await this.checkVerifyCampaignId(dto.verifyId);

    const checkCampaignInvalidToVerify =
      await this.checkCampaignInvalidToVerify(dto.verifyId);
    if (checkCampaignInvalidToVerify) {
      throw new BadRequestException('This campaign already verified');
    }

    const objDataConfig = JSON.parse(
      fs.readFileSync('./dataConfig.json', 'utf-8'),
    );

    if (
      diffDates(
        new Date(dto.dateOpenRegister),
        new Date(dto.startDatePayment),
      ) !== parseInt(objDataConfig.gapOpenRegisterForm)
    )
      throw new BadRequestException(
        `Gap Date Open Register must be in ${
          objDataConfig.gapOpenRegisterForm
        } day(s). Date Payment must be: ${addDays(
          new Date(dto.dateOpenRegister),
          parseInt(objDataConfig.gapOpenRegisterForm) - 1,
        )}`,
      );

    if (
      diffDates(new Date(dto.startDateWrap), new Date(dto.startDatePayment)) !==
      parseInt(objDataConfig.gapPaymentDeposit)
    )
      throw new BadRequestException(
        `Gap Date Payment Deposit must be in ${
          objDataConfig.gapPaymentDeposit
        } day(s). Date Wrapping must be: ${addDays(
          new Date(dto.startDateWrap),
          parseInt(objDataConfig.gapPaymentDeposit) - 1,
        )}`,
      );
    try {
      const verifyCampaign = await this.prisma.verifyCampaign.update({
        where: {
          id: dto.verifyId,
        },
        data: {
          status: StatusVerifyCampaign.ACCEPT,
          campaign: {
            update: {
              startRegisterDate: new Date(dto.dateOpenRegister),
              endRegisterDate: addDays(
                new Date(dto.dateOpenRegister),
                parseInt(objDataConfig.gapOpenRegisterForm) - 1,
              ),
              startWrapDate: new Date(dto.startDateWrap),
              endWrapDate: addDays(
                new Date(dto.startDateWrap),
                parseInt(objDataConfig.gapWrapping) - 1,
              ),
              startPaymentDate: new Date(dto.startDatePayment),
              endPaymentDate: addDays(
                new Date(dto.startDatePayment),
                parseInt(objDataConfig.gapPaymentDeposit) - 1,
              ),
            },
          },
        },
        select: {
          campaignId: true,
          campaign: {
            select: {
              startRunningDate: true,
              campaignName: true,
              duration: true,
              quantityDriver: true,
              route: true,
              wrap: {
                select: {
                  positionWrap: true,
                },
              },
              wrapPrice: true,
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
              contractCampaign: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });
      const isBothSide =
        verifyCampaign.campaign.wrap.positionWrap === 'BOTH_SIDE';
      const extraWrapMoney = isBothSide ? 400000 : 200000;
      const priceWrap = Number(verifyCampaign.campaign.wrapPrice);
      const time = Math.ceil(verifyCampaign.campaign.duration / 30) - 1;

      const totalWrapMoney =
        (priceWrap + time * extraWrapMoney) *
        Number(verifyCampaign.campaign.quantityDriver);

      const totalDriverMoney =
        verifyCampaign.campaign.route.price *
        verifyCampaign.campaign.quantityDriver *
        verifyCampaign.campaign.duration;

      await this.prisma.contractCampaign.create({
        data: {
          contractName: 'Contract ' + verifyCampaign.campaignId,
          campaign: {
            connect: {
              id: verifyCampaign.campaignId,
            },
          },
          totalDriverMoney: totalDriverMoney,
          totalWrapMoney: totalWrapMoney,
          totalSystemMoney: totalDriverMoney * 0.1,
          isAccept: false,
        },
      });

      const message = `<p>Congratulations!. Your campaign information has been accepted</p>
           <p>Please login at the website for more details</p>`;
      await this.mailerService.sendMail({
        to: verifyCampaign.campaign.brand.user.email,
        from: this.appConfigService.getConfig('MAILER'),
        subject: `Result verification Campaign ${verifyCampaign.campaign.campaignName}`,
        html: `
             <h1>Dear ${verifyCampaign.campaign.brand.brandName},</h1></br>
             <p>Thanks for becoming Brandvertise's partner!</p>
              ${message}
             <p>Regards,</p>
             <p style="color: green">Brandvertise</p>
          `,
      });
      return `Accepted verify campaign and Created unique contract. Check mail.`;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async checkCampaignInvalidToVerify(id: string) {
    return await this.prisma.verifyCampaign.findFirst({
      where: {
        AND: [
          { id },
          {
            status: {
              in: ['NEW', 'BANNED', 'BANNED', 'UPDATE', 'ACCEPT'],
            },
          },
        ],
      },
    });
  }

  async checkVerifyCampaignId(id: string) {
    const verifyId = await this.prisma.verifyCampaign.findFirst({
      where: {
        id,
      },
    });
    if (!verifyId) throw new BadRequestException('VerifyID not found');
  }

  async getContractByContractID(contractId: string) {
    const checkIdContract = await this.checkContractId(contractId);
    if (!checkIdContract)
      throw new BadRequestException('Contract ID not found');
    return await this.prisma.contractCampaign.findFirst({
      where: {
        id: contractId,
      },
      select: {
        campaign: {
          select: {
            id: true,
            campaignName: true,
            startRegisterDate: true,
            endRegisterDate: true,
            startRunningDate: true,
            startPaymentDate: true,
            endPaymentDate: true,
            startWrapDate: true,
            route: {
              include: {
                checkpointTime: true,
              },
            },
            endWrapDate: true,
            poster: true,
            description: true,
            duration: true,
            quantityDriver: true,
            wrapPrice: true,
            detailMessage: true,
            brand: {
              select: {
                id: true,
                brandName: true,
                logo: true,
              },
            },
            wrap: {
              select: {
                positionWrap: true,
              },
            },
            contractCampaign: {
              select: {
                id: true,
                contractName: true,
                totalDriverMoney: true,
                totalSystemMoney: true,
                totalWrapMoney: true,
              },
            },
          },
        },
      },
    });
  }

  async checkContractId(id: string) {
    return await this.prisma.contractCampaign.findFirst({
      where: {
        id,
      },
    });
  }

  async checkContractIdOwnByBrand(userId: string, id: string) {
    return await this.prisma.contractCampaign.findFirst({
      where: {
        AND: [
          {
            id,
          },
          {
            campaign: {
              brand: {
                userId,
              },
            },
          },
        ],
      },
      select: {
        campaign: {
          select: {
            statusCampaign: true,
          },
        },
      },
    });
  }

  async acceptContract(userId: string, contractId: string) {
    const checkIdContract = await this.checkContractIdOwnByBrand(
      userId,
      contractId,
    );
    if (!checkIdContract)
      throw new BadRequestException('Contract ID not found');
    if (checkIdContract.campaign.statusCampaign === 'OPEN') {
      throw new BadRequestException('This contract was Accepted');
    }
    try {
      await this.prisma.contractCampaign.update({
        where: {
          id: contractId,
        },
        data: {
          isAccept: true,
          campaign: {
            update: {
              statusCampaign: 'OPEN',
            },
          },
        },
      });
      return `Accepted contract`;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async cancelContract(userId: string, dto: CancelContractDTO) {
    const checkIdContract = await this.checkContractIdOwnByBrand(
      userId,
      dto.contractId,
    );

    if (!checkIdContract)
      throw new BadRequestException('Contract ID not found');
    if (checkIdContract.campaign.statusCampaign === 'CANCELED') {
      throw new BadRequestException('This contract was Canceled');
    }
    try {
      await this.prisma.contractCampaign.update({
        where: {
          id: dto.contractId,
        },
        data: {
          isAccept: false,
          message: dto.message,
          campaign: {
            update: {
              statusCampaign: 'CANCELED',
            },
          },
        },
      });
      return `Cancel contract`;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
