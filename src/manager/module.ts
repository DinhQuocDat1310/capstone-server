import { VerifyCampaignService } from './../verifyCampaign/service';
import { PrismaService } from 'src/prisma/service';
import { Module } from '@nestjs/common';
import { ManagerController } from './controller';
import { ManagerService } from './service';
import { UsersService } from 'src/user/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { AppConfigService } from 'src/config/appConfigService';
import { ContractService } from 'src/contract/service';

@Module({
  controllers: [ManagerController],
  providers: [
    ManagerService,
    AppConfigService,
    PrismaService,
    UsersService,
    VerifyAccountsService,
    VerifyCampaignService,
    ContractService,
  ],
})
export class ManagerModule {}
