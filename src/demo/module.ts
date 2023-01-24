import { Module } from '@nestjs/common';
import { CampaignService } from 'src/campaign/service';
import { ContractService } from 'src/contract/service';
import { DriversService } from 'src/driver/service';
import { EmailsService } from 'src/email/service';
import { ManagerService } from 'src/manager/service';
import { PaymentService } from 'src/payment/service';
import { PrismaService } from 'src/prisma/service';
import { TasksService } from 'src/task/service';
import { UsersService } from 'src/user/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { VerifyCampaignService } from 'src/verifyCampaign/service';
import { AppConfigService } from './../config/appConfigService';
import { DemoController } from './controller';
import { DemoService } from './service';

@Module({
  controllers: [DemoController],
  providers: [
    DemoService,
    PrismaService,
    AppConfigService,
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
    EmailsService,
  ],
})
export class DemoModule {}
