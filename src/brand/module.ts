import { WrapService } from './../wrap/service';
import { UsersService } from 'src/user/service';
import { PrismaService } from 'src/prisma/service';
import { Module } from '@nestjs/common';
import { BrandController } from './controller';
import { BrandsService } from './service';
import { AppConfigService } from 'src/config/appConfigService';
import { ManagerService } from 'src/manager/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';

@Module({
  controllers: [BrandController],
  providers: [
    BrandsService,
    PrismaService,
    UsersService,
    VerifyAccountsService,
    AppConfigService,
    ManagerService,
    WrapService,
  ],
})
export class BrandModule {}
