import { Module } from '@nestjs/common';
import { ReporterService } from './service';
import { ReporterController } from './controller';
import { PrismaService } from 'src/prisma/service';
import { UsersService } from 'src/user/service';
import { TasksService } from 'src/task/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { ManagerService } from 'src/manager/service';
import { VerifyCampaignService } from 'src/verifyCampaign/service';
import { CampaignService } from 'src/campaign/service';
import { PaymentService } from 'src/payment/service';
import { DriversService } from 'src/driver/service';
import { AppConfigService } from 'src/config/appConfigService';
import { EmailsService } from 'src/email/service';

@Module({
  controllers: [ReporterController],
  providers: [
    ReporterService,
    PrismaService,
    UsersService,
    TasksService,
    VerifyAccountsService,
    ManagerService,
    VerifyCampaignService,
    CampaignService,
    PaymentService,
    DriversService,
    AppConfigService,
    EmailsService,
  ],
})
export class ReporterModule {}
