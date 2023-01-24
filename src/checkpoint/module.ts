import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import { CheckPointController } from './controller';
import { CheckPointService } from './service';

@Module({
  controllers: [CheckPointController],
  providers: [CheckPointService, PrismaService],
})
export class CheckPointModule {}
