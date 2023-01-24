import { VerifyCampaignService } from './../verifyCampaign/service';
import { AppConfigService } from './../config/appConfigService';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { UsersService } from './../user/service';
import { PrismaService } from 'src/prisma/service';
import { Module } from '@nestjs/common';
import { AdminService } from './service';
import { AdminController } from './controller';
import { ManagerService } from 'src/manager/service';
import { WrapService } from 'src/wrap/service';

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    PrismaService,
    UsersService,
    VerifyAccountsService,
    AppConfigService,
    VerifyCampaignService,
    ManagerService,
    WrapService,
  ],
})
export class AdminModule {}
