import { Module } from '@nestjs/common';
import { BrandsService } from 'src/brand/service';
import { CloudinaryService } from 'src/cloudinary/service';
import { AppConfigService } from 'src/config/appConfigService';
import { ManagerService } from 'src/manager/service';
import { PrismaService } from 'src/prisma/service';
import { UsersService } from 'src/user/service';
import { VerifyBrandService } from 'src/verify-brand/service';

import { EmailsController } from './controller';
import { EmailsService } from './service';

@Module({
  controllers: [EmailsController],
  providers: [
    EmailsService,
    UsersService,
    PrismaService,
    BrandsService,
    AppConfigService,
    CloudinaryService,
    VerifyBrandService,
    ManagerService,
  ],
})
export class EmailsModule {}
