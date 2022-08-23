import { PrismaService } from 'src/prisma/service';
import { Module } from '@nestjs/common';
import { BrandController } from './controller';
import { BrandsService } from './service';

@Module({
  controllers: [BrandController],
  providers: [BrandsService, PrismaService],
})
export class BrandModule {}
