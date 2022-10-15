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
              dateOpenRegister: dateOpenRegis,
              startRegisterDate: dateOpenRegis,
              endRegisterDate: dateEndRegis,
              datePaymentDeposit: datePaymentDepose,
              dateEndPaymentDeposit: dateEndPaymentDepose,
              dateWrapSticket: dateWrapStick,
              dateEndWarpSticket: dateEndWarpStick,
            },
          },
        },
        select: {
          campaignId: true,
          campaign: {
            select: {
              campaignName: true,
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
      await this.prisma.contractCampaign.create({
        data: {
          contractName: 'Contract ' + verifyCampaign.campaignId,
          campaign: {
            connect: {
              id: verifyCampaign.campaignId,
            },
          },
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
            dateOpenRegister: true,
            startRegisterDate: true,
            endRegisterDate: true,
            datePaymentDeposit: true,
            dateEndPaymentDeposit: true,
            dateWrapSticket: true,
            dateEndWarpSticket: true,
            startRunningDate: true,
            totalKm: true,
            description: true,
            duration: true,
            minimumKmDrive: true,
            quantityDriver: true,
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
                imagePoster: true,
                positionWarp: true,
              },
            },
            contractCampaign: {
              select: {
                id: true,
                contractName: true,
                totalDriverMoney: true,
                totalSystemMoney: true,
                totalWarpType: true,
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
}
