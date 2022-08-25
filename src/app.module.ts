import { SmsModule } from './sms/module';
import { PrismaService } from './prisma/service';
import { AppConfigService } from './config/appConfigService';
import { MailerModule } from '@nestjs-modules/mailer';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrandModule } from './brand/module';
import { EmailsModule } from './email/module';
import { ManagerModule } from './manager/module';
import { UserModule } from './user/module';
import { AuthModule } from './auth/module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guard/roles.guard';
import { UsersService } from './user/service';
import * as Joi from '@hapi/joi';

@Module({
  imports: [
    AuthModule,
    UserModule,
    BrandModule,
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
  ],

  providers: [
    AppConfigService,
    UsersService,
    PrismaService,
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  controllers: [],
})
export class AppModule {}
