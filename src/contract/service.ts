import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';

@Injectable()
export class ContractService {
  constructor(private readonly prisma: PrismaService) {}

  async connectContractToCampaign(campaignId: string) {
    return await this.prisma.contractCampaign.create({
      data: {
        contractName: 'Contract ' + campaignId,
        campaign: {
          connect: {
            id: campaignId,
          },
        },
      },
    });
  }
}
