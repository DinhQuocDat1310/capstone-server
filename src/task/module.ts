import { Module } from '@nestjs/common';
import { ManagerService } from 'src/manager/service';
import { PrismaService } from 'src/prisma/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { TasksService } from './service';

@Module({
  providers: [
    TasksService,
    ManagerService,
    VerifyAccountsService,
    PrismaService,
  ],
})
export class TasksModule {}
