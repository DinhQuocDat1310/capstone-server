import { AppConfigService } from './../config/appConfigService';
import { Module } from '@nestjs/common';
import { ContractService } from './service';
import { ContractController } from './controller';
import { PrismaService } from 'src/prisma/service';

@Module({
  controllers: [ContractController],
  providers: [ContractService, PrismaService, AppConfigService],
})
export class ContractModule {}
