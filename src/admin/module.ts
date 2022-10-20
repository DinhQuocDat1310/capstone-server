import { UsersService } from './../user/service';
import { PrismaService } from 'src/prisma/service';
import { Module } from '@nestjs/common';
import { AdminService } from './service';
import { AdminController } from './controller';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, UsersService],
})
export class AdminModule {}
