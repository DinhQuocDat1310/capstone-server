import { VerifyCampaignService } from './../verifyCampaign/service';
import { PrismaService } from './../prisma/service';
import { Module } from '@nestjs/common';
import { CampaignService } from './service';
import { CampaignController } from './controller';
import { AppConfigService } from 'src/config/appConfigService';
import { ContractService } from 'src/contract/service';

@Module({
  controllers: [CampaignController],
  providers: [
    CampaignService,
    PrismaService,
    VerifyCampaignService,
    AppConfigService,
    ContractService,
  ],
})
export class CampaignModule {}
