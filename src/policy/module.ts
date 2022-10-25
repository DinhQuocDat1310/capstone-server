import { Module } from '@nestjs/common';
import { PolicyService } from './service';
import { PolicyController } from './controller';
import { PrismaService } from 'src/prisma/service';

@Module({
  controllers: [PolicyController],
  providers: [PolicyService, PrismaService],
})
export class PolicyModule {}
