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

@Injectable()
export class ContractService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async createCampaignContract(userId: string, dto: CampaignContractDTO) {
    const checkCampaignHaveContract = await this.checkCampaignHaveContract(
      dto.verifyId,
    );
    if (checkCampaignHaveContract) {
      throw new BadRequestException(
        'This campaign already Accepted and have unique contract',
      );
    }
    const parseDateOpenRegister = new Date(dto.dateOpenRegister);
    parseDateOpenRegister.setDate(parseDateOpenRegister.getDate() + 1);
    const dateOpenRegis = parseDateOpenRegister.toISOString();

    const dateEndRegister = parseDateOpenRegister.setDate(
      parseDateOpenRegister.getDate() + 5,
    );
    const parseDateEndRegister = new Date(dateEndRegister);
    const dateEndRegis = parseDateEndRegister.toISOString();

    const parseDatePaymentDeposit = new Date(dto.datePaymentDeposit);
    parseDatePaymentDeposit.setDate(parseDatePaymentDeposit.getDate() + 1);
    const datePaymentDepose = parseDatePaymentDeposit.toISOString();

    const dateEndPaymentDeposit = parseDatePaymentDeposit.setDate(
      parseDatePaymentDeposit.getDate() + 3,
    );
    const parseEndDatePaymentDeposit = new Date(dateEndPaymentDeposit);
    const dateEndPaymentDepose = parseEndDatePaymentDeposit.toISOString();

    const parseDateWarpSticket = new Date(dto.dateWarpSticket);
    parseDateWarpSticket.setDate(parseDateWarpSticket.getDate() + 1);
    const dateWrapStick = parseDateWarpSticket.toISOString();

    const dateEndWarpSticket = parseDateWarpSticket.setDate(
      parseDateWarpSticket.getDate() + 3,
    );
    const parseEndWarpSticket = new Date(dateEndWarpSticket);
    const dateEndWarpStick = parseEndWarpSticket.toISOString();

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
              locationCampaign: {
                select: {
                  locationName: true,
                },
              },
              locationPricePerKm: true,
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
      const totalDriverMoney =
        parseFloat(verifyCampaign.campaign.minimumKmDrive) *
        parseFloat(verifyCampaign.campaign.locationPricePerKm) *
        parseFloat(verifyCampaign.campaign.quantityDriver) *
        parseFloat(verifyCampaign.campaign.duration);
      const totalWrapMoney =
        parseFloat(verifyCampaign.campaign.wrapPrice) *
        parseFloat(verifyCampaign.campaign.quantityDriver);
      const totalMoney = totalDriverMoney + totalWrapMoney;
      const totalDeposit = totalMoney * 0.2;
      const totalSystemMoney = totalMoney * 0.1;
      const totalDriverMoneyVND = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(Number(totalDriverMoney));

      const totalWrapMoneyVND = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(Number(totalWrapMoney));

      const totalDepositVND = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(Number(totalDeposit));

      const totalSystemMoneyVND = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(Number(totalSystemMoney));

      await this.prisma.contractCampaign.create({
        data: {
          contractName: 'Contract ' + verifyCampaign.campaignId,
          campaign: {
            connect: {
              id: verifyCampaign.campaignId,
            },
          },
          totalDriverMoney: totalDriverMoneyVND.toString(),
          totalWrapMoney: totalWrapMoneyVND.toString(),
          totalSystemMoney: totalSystemMoneyVND.toString(),
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
          price: totalDepositVND.toString(),
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

  async checkCampaignHaveContract(id: string) {
    return await this.prisma.verifyCampaign.findFirst({
      where: {
        AND: [{ id }, { status: 'ACCEPT' }],
      },
    });
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

  async cancelContract(userId: string, contractId: string) {
    const checkIdContract = await this.checkContractIdOwnByBrand(
      userId,
      contractId,
    );

    if (!checkIdContract)
      throw new BadRequestException('Contract ID not found');
    if (checkIdContract.campaign.statusCampaign === 'CANCELED') {
      throw new BadRequestException('This contract was Canceled');
    }
    try {
      await this.prisma.contractCampaign.update({
        where: {
          id: contractId,
        },
        data: {
          isAccept: false,
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
