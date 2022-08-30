import { UsersService } from 'src/user/service';
import { PrismaService } from 'src/prisma/service';
import { Module } from '@nestjs/common';
import { BrandController } from './controller';
import { BrandsService } from './service';
import { AppConfigService } from 'src/config/appConfigService';
import { CloudinaryService } from 'src/cloudinary/service';
import { VerifyBrandService } from 'src/verify-brand/service';
import { ManagerService } from 'src/manager/service';

@Module({
  controllers: [BrandController],
  providers: [
    BrandsService,
    PrismaService,
    UsersService,
    AppConfigService,
    CloudinaryService,
    VerifyBrandService,
    ManagerService,
  ],
})
export class BrandModule {}
