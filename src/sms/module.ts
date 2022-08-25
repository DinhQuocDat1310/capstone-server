import { PrismaService } from './../prisma/service';
import { AppConfigService } from './../config/appConfigService';
import { Module } from '@nestjs/common';
import { SmsService } from './service';
import { SmsController } from './controller';
import { UsersService } from 'src/user/service';

@Module({
  providers: [SmsService, AppConfigService, UsersService, PrismaService],
  controllers: [SmsController],
})
export class SmsModule {}
