import { UsersService } from 'src/user/service';
import { PrismaService } from 'src/prisma/service';
import { Module } from '@nestjs/common';
import { DriverController } from './controller';
import { DriversService } from './service';
import { AppConfigService } from 'src/config/appConfigService';
import { ManagerService } from 'src/manager/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { LocationService } from 'src/location/service';
import { VerifyOdoService } from 'src/verifyOdo/service';

@Module({
  controllers: [DriverController],
  providers: [
    DriversService,
    PrismaService,
    UsersService,
    VerifyAccountsService,
    AppConfigService,
    ManagerService,
    LocationService,
    VerifyOdoService,
  ],
})
export class DriverModule {}
