import { Module } from '@nestjs/common';
import { AppConfigService } from 'src/config/appConfigService';
import { PrismaService } from 'src/prisma/service';
import { UserController } from './controller';
import { UsersService } from './service';

@Module({
  controllers: [UserController],
  providers: [UsersService, PrismaService, AppConfigService],
})
export class UserModule {}
