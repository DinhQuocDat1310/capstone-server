import { Module } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/service';
import { AppConfigService } from 'src/config/appConfigService';
import { PrismaService } from 'src/prisma/service';
import { UsersService } from 'src/user/service';
import { EmailsController } from './controller';
import { EmailsService } from './service';
import { ManagerService } from 'src/manager/service';
@Module({
  controllers: [EmailsController],
  providers: [
    EmailsService,
    UsersService,
    PrismaService,
    AppConfigService,
    ManagerService,
    CloudinaryService,
  ],
})
export class EmailsModule {}
