import { UsersService } from './../user/service';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import { PaymentController } from './controller';
import { PaymentService } from './service';
import { AppConfigService } from 'src/config/appConfigService';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService, UsersService, AppConfigService],
})
export class PaymentModule {}
