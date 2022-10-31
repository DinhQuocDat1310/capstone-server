import { CancelContractDTO } from './dto';
import { AppConfigService } from 'src/config/appConfigService';
import { MailerService } from '@nestjs-modules/mailer';
import { VerifyCampaignStatus } from '@prisma/client';
import { CampaignContractDTO } from './../campaign/dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import * as fs from 'fs';

@Injectable()
export class ContractService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async createCampaignContract(userId: string, dto: CampaignContractDTO) {
    await this.checkVerifyCampaignId(dto.verifyId);
    const checkCampaignInvalidToVerify =
      await this.checkCampaignInvalidToVerify(dto.verifyId);
    if (checkCampaignInvalidToVerify) {
      throw new BadRequestException('This campaign already verified');
    }

    const objDataConfig = JSON.parse(
      fs.readFileSync('./dataConfig.json', 'utf-8'),
    );

    const parseDateOpenRegister = new Date(dto.dateOpenRegister);
    parseDateOpenRegister.setDate(parseDateOpenRegister.getDate() + 1);
    const dateOpenRegis = parseDateOpenRegister.toISOString();

    const dateEndRegister = parseDateOpenRegister.setDate(
      parseDateOpenRegister.getDate() +
        parseInt(objDataConfig.gapOpenRegisterForm),
    );
    const parseDateEndRegister = new Date(dateEndRegister);
    const dateEndRegis = parseDateEndRegister.toISOString();

    const parseDatePaymentDeposit = new Date(dto.datePaymentDeposit);
    parseDatePaymentDeposit.setDate(parseDatePaymentDeposit.getDate() + 1);
    const datePaymentDepose = parseDatePaymentDeposit.toISOString();

    const dateEndPaymentDeposit = parseDatePaymentDeposit.setDate(
      parseDatePaymentDeposit.getDate() +
        parseInt(objDataConfig.gapPaymentDeposit),
    );
    const parseEndDatePaymentDeposit = new Date(dateEndPaymentDeposit);
    const dateEndPaymentDepose = parseEndDatePaymentDeposit.toISOString();

    const parseDateWarpSticket = new Date(dto.dateWarpSticket);
    parseDateWarpSticket.setDate(parseDateWarpSticket.getDate() + 1);
    const dateWrapStick = parseDateWarpSticket.toISOString();

    const dateEndWarpSticket = parseDateWarpSticket.setDate(
      parseDateWarpSticket.getDate() + parseInt(objDataConfig.gapWrapping),
    );
    const parseEndWarpSticket = new Date(dateEndWarpSticket);
    const dateEndWarpStick = parseEndWarpSticket.toISOString();

    const inputDateOpenRegis = new Date(dateOpenRegis).getDate();

    const inputDatePayment = new Date(datePaymentDepose).getDate();

    const validDatePayment = new Date(dateEndRegis);

    if (
      inputDatePayment - inputDateOpenRegis !==
      parseInt(objDataConfig.gapOpenRegisterForm) + 1
    )
      throw new BadRequestException(
        `Gap Date Open Register must be in ${
          objDataConfig.gapOpenRegisterForm
        } day(s). Date Payment must be: ${
          validDatePayment.getMonth() +
          1 +
          '/' +
          validDatePayment.getDate() +
          '/' +
          validDatePayment.getFullYear()
        }`,
      );

    const inputDateWrap = new Date(dateWrapStick).getDate();

    const validDateWrap = new Date(dateEndPaymentDepose);

    if (
      inputDateWrap - inputDatePayment !==
      parseInt(objDataConfig.gapPaymentDeposit) + 1
    )
      throw new BadRequestException(
        `Gap Date Payment Deposit must be in ${
          objDataConfig.gapPaymentDeposit
        } day(s). Date Wrapping must be: ${
          validDateWrap.getMonth() +
          1 +
          '/' +
          validDateWrap.getDate() +
          '/' +
          validDateWrap.getFullYear()
        }`,
      );
    try {
      const verifyCampaign = await this.prisma.verifyCampaign.update({
        where: {
          id: dto.verifyId,
        },
        data: {
          status: VerifyCampaignStatus.ACCEPT,
          campaign: {
            update: {
              startRegisterDate: dateOpenRegis,
              endRegisterDate: dateEndRegis,
              startWrapDate: dateWrapStick,
              endWrapDate: dateEndWarpStick,
            },
          },
        },
        select: {
          campaignId: true,
          campaign: {
            select: {
              campaignName: true,
              duration: true,
              minimumKmDrive: true,
              quantityDriver: true,
              totalKm: true,
              locationPricePerKm: true,
              locationCampaign: {
                select: {
                  locationName: true,
                },
              },
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
      const priceWrap = parseFloat(verifyCampaign.campaign.wrapPrice);
      const numDriver = parseInt(verifyCampaign.campaign.quantityDriver);
      const time = parseInt(verifyCampaign.campaign.duration) / 30 - 1;
      const totalWrapMoney = (priceWrap + time * extraWrapMoney) * numDriver;

      const totalDriverMoney =
        parseFloat(verifyCampaign.campaign.minimumKmDrive) *
        parseFloat(verifyCampaign.campaign.locationPricePerKm) *
        parseFloat(verifyCampaign.campaign.quantityDriver) *
        parseFloat(verifyCampaign.campaign.duration);

      const totalMoney = totalDriverMoney + totalWrapMoney;
      const totalDeposit = totalMoney * 0.2;
      const totalSystemMoney = totalMoney * 0.1;

      await this.prisma.contractCampaign.create({
        data: {
          contractName: 'Contract ' + verifyCampaign.campaignId,
          campaign: {
            connect: {
              id: verifyCampaign.campaignId,
            },
          },
          totalDriverMoney: totalDriverMoney.toString(),
          totalWrapMoney: totalWrapMoney.toString(),
          totalSystemMoney: totalSystemMoney.toString(),
          isAccept: false,
        },
      });
      await this.prisma.paymentDebit.create({
        data: {
          campaign: {
            connect: {
              id: verifyCampaign.campaignId,
            },
          },
          type: 'PREPAY',
          paidDate: datePaymentDepose,
          expiredDate: dateEndPaymentDepose,
          price: totalDeposit.toString(),
        },
      });
      const message = `<p>Congratulations!. Your campaign information has been accepted</p>
           <p>Please login at the website for more details</p>`;
      await this.mailerService.sendMail({
        to: verifyCampaign.campaign.brand.user.email,
        from: this.appConfigService.getConfig('MAILER'),
        subject: `Result verification Campaign ${verifyCampaign.campaign.campaignName}`,
        html: `
             <p>Dear ${verifyCampaign.campaign.brand.brandName},</p></br>
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
            startWrapDate: true,
            endWrapDate: true,
            poster: true,
            totalKm: true,
            description: true,
            duration: true,
            minimumKmDrive: true,
            quantityDriver: true,
            locationPricePerKm: true,
            wrapPrice: true,
            detailMessage: true,
            paymentDebit: {
              select: {
                id: true,
                paidDate: true,
                expiredDate: true,
                price: true,
                type: true,
              },
            },
            brand: {
              select: {
                id: true,
                brandName: true,
                logo: true,
              },
            },
            locationCampaign: {
              select: {
                locationName: true,
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
