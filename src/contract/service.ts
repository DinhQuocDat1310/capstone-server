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
  constructor(private readonly prisma: PrismaService) {}

  async createCampaignContract(userId: string, dto: CampaignContractDTO) {
    const parseDateOpenRegister = new Date(dto.dateOpenRegister);
    parseDateOpenRegister.setDate(parseDateOpenRegister.getDate() + 1);
    const dateStartRegister = new Date(dto.dateOpenRegister);
    const dateEndRegister = dateStartRegister.setDate(
      dateStartRegister.getDate() + 5,
    );
    const parseDateEndRegister = new Date(dateEndRegister);
    const parseDatePaymentDeposit = new Date(dto.datePaymentDeposit);
    const dateEndPayementDeposit = parseDateOpenRegister.setDate(
      parseDatePaymentDeposit.getDate() + 3,
    );
    const parseEndDatePaymentDeposit = new Date(dateEndPayementDeposit);
    const parseDateWarpSticket = new Date(dto.dateWarpSticket);
    const dateEndWarpSticket = parseDateWarpSticket.setDate(
      parseDateWarpSticket.getDate() + 3,
    );
    const parseEndWarpSticket = new Date(dateEndWarpSticket);

    try {
      const verifyCampaign = await this.prisma.verifyCampaign.update({
        where: {
          id: dto.verifyId,
        },
        data: {
          status: VerifyCampaignStatus.ACCEPT,
          campaign: {
            update: {
              dateOpenRegister: parseDateOpenRegister.toISOString(),
              startRegisterDate: dateStartRegister.toISOString(),
              endRegisterDate: parseDateEndRegister.toISOString(),
              datePaymentDeposit: parseDatePaymentDeposit.toISOString(),
              dateWrapSticket: parseDateWarpSticket.toISOString(),
            },
          },
        },
        select: {
          campaignId: true,
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
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
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
            datePaymentDeposit: true,
            dateWrapSticket: true,
            startRunningDate: true,
            startRegisterDate: true,
            endRegisterDate: true,
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
