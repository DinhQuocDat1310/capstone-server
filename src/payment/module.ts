import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import { PaymentController } from './controller';
import { PaymentService } from './service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService],
})
export class PaymentModule {}
