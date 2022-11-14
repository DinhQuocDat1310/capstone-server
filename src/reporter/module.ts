import { Module } from '@nestjs/common';
import { ReporterService } from './service';
import { ReporterController } from './controller';
import { PrismaService } from 'src/prisma/service';
import { UsersService } from 'src/user/service';

@Module({
  controllers: [ReporterController],
  providers: [ReporterService, PrismaService, UsersService],
})
export class ReporterModule {}
