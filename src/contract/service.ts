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
import * as moment from 'moment';

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

    const dateOpenRegister = moment(dto.dateOpenRegister, 'MM/DD/YYYY')
      .toDate()
      .toLocaleDateString('vn-VN');

    const dateEndRegister = moment(dto.dateOpenRegister, 'MM/DD/YYYY')
      .add(parseInt(objDataConfig.gapOpenRegisterForm) - 1, 'days')
      .toDate()
      .toLocaleDateString('vn-VN');

    const datePaymentDepose = moment(dto.datePaymentDeposit, 'MM/DD/YYYY')
      .toDate()
      .toLocaleDateString('vn-VN');

    const dateEndPaymentDeposit = moment(dto.datePaymentDeposit, 'MM/DD/YYYY')
      .add(parseInt(objDataConfig.gapPaymentDeposit) - 1, 'days')
      .toDate()
      .toLocaleDateString('vn-VN');

    const dateWrapStick = moment(dto.dateWarpSticket, 'MM/DD/YYYY')
      .toDate()
      .toLocaleDateString('vn-VN');

    const dateEndWarpSticket = moment(dto.dateWarpSticket, 'MM/DD/YYYY')
      .add(parseInt(objDataConfig.gapWrapping) - 1, 'days')
      .toDate()
      .toLocaleDateString('vn-VN');

    const inputDateOpenRegis = moment(dto.dateOpenRegister, 'MM/DD/YYYY');
    const inputDatePayment = moment(dto.datePaymentDeposit, 'MM/DD/YYYY');

    if (
      Math.abs(inputDateOpenRegis.diff(inputDatePayment, 'days')) !==
      parseInt(objDataConfig.gapOpenRegisterForm)
    )
      throw new BadRequestException(
        `Gap Date Open Register must be in ${
          objDataConfig.gapOpenRegisterForm
        } day(s). Date Payment must be: ${inputDateOpenRegis
          .add(parseInt(objDataConfig.gapOpenRegisterForm) - 1, 'days')
          .toDate()
          .toLocaleDateString('vn-VN')}`,
      );

    const inputDateWrap = moment(dto.dateWarpSticket, 'MM/DD/YYYY');

    if (
      Math.abs(inputDatePayment.diff(inputDateWrap, 'days')) !==
      parseInt(objDataConfig.gapPaymentDeposit)
    )
      throw new BadRequestException(
        `Gap Date Payment Deposit must be in ${
          objDataConfig.gapPaymentDeposit
        } day(s). Date Wrapping must be: ${inputDateWrap
          .add(parseInt(objDataConfig.gapPaymentDeposit) - 1, 'days')
          .toDate()
          .toLocaleDateString('vn-VN')}`,
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
              startRegisterDate: dateOpenRegister,
              endRegisterDate: dateEndRegister,
              startWrapDate: dateWrapStick,
              endWrapDate: dateEndWarpSticket,
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
      const time =
        Math.ceil(parseInt(verifyCampaign.campaign.duration) / 30) - 1;
      const totalWrapMoney = (priceWrap + time * extraWrapMoney) * numDriver;

      const totalDriverMoney =
        parseFloat(verifyCampaign.campaign.minimumKmDrive) *
        parseFloat(verifyCampaign.campaign.locationPricePerKm) *
        parseFloat(verifyCampaign.campaign.quantityDriver) *
        parseFloat(verifyCampaign.campaign.duration);

      const totalSystemMoney = totalDriverMoney * 0.1;

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
      await this.prisma.paymentDebit.createMany({
        data: [
          {
            campaignId: verifyCampaign.campaignId,
            type: 'PREPAY',
            createDate: datePaymentDepose,
            expiredDate: dateEndPaymentDeposit,
          },
          {
            campaignId: verifyCampaign.campaignId,
            type: 'POSTPAID',
            createDate: moment(
              verifyCampaign.campaign.startRunningDate,
              'MM/DD/YYYY',
            )
              .add(Number(verifyCampaign.campaign.duration), 'days')
              .toDate()
              .toLocaleDateString('vn-VN'),
            expiredDate: moment(
              verifyCampaign.campaign.startRunningDate,
              'MM/DD/YYYY',
            )
              .add(
                Number(verifyCampaign.campaign.duration) +
                  parseInt(objDataConfig.gapPaymentDeposit) -
                  1,
                'days',
              )
              .toDate()
              .toLocaleDateString('vn-VN'),
          },
        ],
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
              where: {
                campaign: {
                  contractCampaign: {
                    id: contractId,
                  },
                },
                type: {
                  in: ['PREPAY', 'POSTPAID'],
                },
              },
              select: {
                id: true,
                paidDate: true,
                expiredDate: true,
                createDate: true,
                price: true,
                type: true,
                isValid: true,
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
      const contract = await this.prisma.contractCampaign.update({
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
        select: {
          campaign: {
            select: {
              paymentDebit: {
                where: {
                  type: 'PREPAY',
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });
      await this.prisma.paymentDebit.update({
        where: {
          id: contract.campaign.paymentDebit[0].id,
        },
        data: {
          isValid: true,
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
