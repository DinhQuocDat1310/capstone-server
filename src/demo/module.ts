import { AppConfigService } from './../config/appConfigService';
import { Module } from '@nestjs/common';
import { DemoService } from './service';
import { DemoController } from './controller';
import { PrismaService } from 'src/prisma/service';
import { TasksService } from 'src/task/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { ManagerService } from 'src/manager/service';
import { VerifyCampaignService } from 'src/verifyCampaign/service';
import { ContractService } from 'src/contract/service';
import { CampaignService } from 'src/campaign/service';
import { PaymentService } from 'src/payment/service';
import { DriversService } from 'src/driver/service';
import { UsersService } from 'src/user/service';
import { LocationService } from 'src/location/service';
import { EmailsService } from 'src/email/service';

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
    LocationService,
    EmailsService,
  ],
})
export class DemoModule {}
