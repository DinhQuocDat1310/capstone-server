import { ManagerService } from './../manager/service';
import { UsersService } from 'src/user/service';
import { PrismaService } from './../prisma/service';
import { Module } from '@nestjs/common';
import { VerifyBrandController } from './controller';
import { VerifyBrandService } from './service';
import { AppConfigService } from 'src/config/appConfigService';
import { CloudinaryService } from 'src/cloudinary/service';

@Module({
  controllers: [VerifyBrandController],
  providers: [
    VerifyBrandService,
    PrismaService,
    UsersService,
    ManagerService,
    AppConfigService,
    CloudinaryService,
  ],
})
export class VerifyBrandModule {}
