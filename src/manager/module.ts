import { PrismaService } from 'src/prisma/service';
import { Module } from '@nestjs/common';
import { ManagerController } from './controller';
import { ManagerService } from './service';
import { UsersService } from 'src/user/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';

@Module({
  controllers: [ManagerController],
  providers: [
    ManagerService,
    PrismaService,
    UsersService,
    VerifyAccountsService,
  ],
})
export class ManagerModule {}
