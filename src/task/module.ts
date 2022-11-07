import { VerifyCampaignService } from './../verifyCampaign/service';
import { Module } from '@nestjs/common';
import { AppConfigService } from 'src/config/appConfigService';
import { ManagerService } from 'src/manager/service';
import { PrismaService } from 'src/prisma/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { TasksService } from './service';
import { ContractService } from 'src/contract/service';
import { CampaignService } from 'src/campaign/service';
import { PaymentService } from 'src/payment/service';
import { DriversService } from 'src/driver/service';
import { UsersService } from 'src/user/service';

@Module({
  providers: [
    TasksService,
    ManagerService,
    VerifyAccountsService,
    PrismaService,
    AppConfigService,
    VerifyCampaignService,
    ContractService,
    CampaignService,
    PaymentService,
    DriversService,
    UsersService,
  ],
})
export class TasksModule {}
