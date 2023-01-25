import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import { CheckPointController } from './controller';
import { CheckPointService } from './service';
import { GoogleService } from 'src/google/service';
import { AppConfigService } from 'src/config/appConfigService';

@Module({
  controllers: [CheckPointController],
  providers: [
    CheckPointService,
    PrismaService,
    GoogleService,
    AppConfigService,
  ],
})
export class CheckPointModule {}
