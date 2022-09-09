import { PrismaService } from 'src/prisma/service';
import { Module } from '@nestjs/common';
import { ManagerController } from './controller';
import { ManagerService } from './service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/service';

@Module({
  controllers: [ManagerController],
  providers: [ManagerService, PrismaService, UsersService, JwtService],
})
export class ManagerModule {}
