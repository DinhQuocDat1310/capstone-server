import { Module } from '@nestjs/common';
import { FaqService } from './service';
import { FaqController } from './controller';
import { PrismaService } from 'src/prisma/service';

@Module({
  controllers: [FaqController],
  providers: [FaqService, PrismaService],
})
export class FaqModule {}
