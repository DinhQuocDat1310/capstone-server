import { VerifyCampaignService } from './../verifyCampaign/service';
import { PrismaService } from 'src/prisma/service';
import { Module } from '@nestjs/common';
import { UsersService } from 'src/user/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { AppConfigService } from 'src/config/appConfigService';
import { ContractService } from 'src/contract/service';
import { AutoAssignController } from './controller';

@Module({
  controllers: [AutoAssignController],
  providers: [
    AppConfigService,
    PrismaService,
    UsersService,
    VerifyAccountsService,
    VerifyCampaignService,
    ContractService,
  ],
})
export class AutoAssignModule {}
