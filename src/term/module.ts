import { PrismaService } from 'src/prisma/service';
import { Module } from '@nestjs/common';
import { TermService } from './service';
import { TermController } from './controller';

@Module({
  controllers: [TermController],
  providers: [TermService, PrismaService],
})
export class TermModule {}
