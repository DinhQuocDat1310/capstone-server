import { SmsModule } from './sms/module';
import { PrismaService } from './prisma/service';
import { AppConfigService } from './config/appConfigService';
import { MailerModule } from '@nestjs-modules/mailer';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrandModule } from './brand/module';
import { EmailsModule } from './email/module';
import { UserModule } from './user/module';
import { AuthModule } from './auth/module';
import { UsersService } from './user/service';
import { CloudinaryModule } from './cloudinary/module';
import { ManagerModule } from './manager/module';
import * as Joi from '@hapi/joi';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './task/module';
import { DriverModule } from './driver/module';
import { CampaignModule } from './campaign/module';
import { ContractModule } from './contract/module';
import { AdminModule } from './admin/module';
import { FaqModule } from './faq/module';
import { AutoAssignModule } from './autoAssign/module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BrandModule,
    DriverModule,
    ManagerModule,
    SmsModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: Joi.object({
        TWILIO_ACCOUNT_SID: Joi.string().required(),
        TWILIO_AUTH_TOKEN: Joi.string().required(),
        TWILIO_VERIFICATION_SERVICE_SID: Joi.string().required(),
      }),
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.HOST_MAILER,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASS,
        },
      },
    }),
    EmailsModule,
    CacheModule.register({
      isGlobal: true,
    }),
    CloudinaryModule,
    ScheduleModule.forRoot(),
    TasksModule,
    CampaignModule,
    ContractModule,
    AdminModule,
    FaqModule,
    AutoAssignModule,
  ],
  providers: [AppConfigService, UsersService, PrismaService],
  controllers: [],
})
export class AppModule {}
