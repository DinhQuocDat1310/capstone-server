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
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './task/module';
import { DriverModule } from './driver/module';
import { CampaignModule } from './campaign/module';
import { ContractModule } from './contract/module';
import { AdminModule } from './admin/module';
import { FaqModule } from './faq/module';
import { AutoAssignModule } from './autoAssign/module';
import { PolicyModule } from './policy/module';
import { ConfigJsonModule } from './config-json/module';
import { PaymentModule } from './payment/module';
import { ReporterModule } from './reporter/module';
import { DemoModule } from './demo/module';
import { TermModule } from './term/module';

@Module({
  imports: [
    DemoModule,
    AuthModule,
    UserModule,
    BrandModule,
    DriverModule,
    ManagerModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
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
    PolicyModule,
    PaymentModule,
    ConfigJsonModule,
    ReporterModule,
    TermModule,
  ],
  providers: [AppConfigService, UsersService, PrismaService],
  controllers: [],
})
export class AppModule {}
