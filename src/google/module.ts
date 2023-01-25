import { PrismaService } from 'src/prisma/service';
import { Module } from '@nestjs/common';
import { GoogleService } from './service';
import { GoogleController } from './controller';
import { AppConfigService } from 'src/config/appConfigService';

@Module({
  controllers: [GoogleController],
  providers: [GoogleService, PrismaService, AppConfigService],
})
export class GoogleModule {}
