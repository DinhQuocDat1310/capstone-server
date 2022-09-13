import { UsersService } from 'src/user/service';
import {
  BadRequestException,
  CACHE_MANAGER,
  HttpStatus,
  Inject,
  Injectable,
  MethodNotAllowedException,
} from '@nestjs/common';
import { AppConfigService } from 'src/config/appConfigService';
import { Twilio } from 'twilio';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';
import { EXPIRED_CODE_FIVE_MINUTES } from 'src/constants/cache-code';
import { UserSignIn } from 'src/auth/dto';

@Injectable()
export class SmsService {
  private readonly twilioClient: Twilio;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: AppConfigService,
    private readonly userService: UsersService,
  ) {
    const accountSid = configService.getConfig('TWILIO_ACCOUNT_SID');
    const authToken = configService.getConfig('TWILIO_AUTH_TOKEN');
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendOTP(userReq: UserSignIn) {
    const user = await this.userService.findUserByUserId(userReq.id);
    try {
      const serviceSid = this.configService.getConfig(
        'TWILIO_VERIFICATION_SERVICE_SID',
      );
      const OTPCached: { code: string; remainingInput: number } =
        await this.cacheManager.get(user.phoneNumber);
      if (OTPCached) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'We have sent the OTP to your phone. Please try again in a few minutes',
        };
      }
      const result = await this.twilioClient.verify
        .services(serviceSid)
        .verifications.create({
          to: userReq.phoneNumber,
          channel: 'sms',
          locale: 'en',
        });
      if (result) {
        await this.cacheManager.set(
          userReq.phoneNumber,
          {
            remainingInput: 5,
          },
          { ttl: EXPIRED_CODE_FIVE_MINUTES },
        );
        return {
          message: 'Send OTP to your phone number success',
          timeExpiredInSecond: EXPIRED_CODE_FIVE_MINUTES,
        };
      }
    } catch (error) {
      if (error.code === 20429) {
        throw new MethodNotAllowedException({
          statusCode: HttpStatus.METHOD_NOT_ALLOWED,
          message: 'Too many request',
        });
      }
      throw new BadRequestException("Phone number isn't existed");
    }
  }

  async verifyOTP(userReq: UserSignIn, codeInput: string) {
    const OTPCached: { code: string; remainingInput: number } =
      await this.cacheManager.get(userReq.phoneNumber);
    if (!OTPCached) {
      return {
        statusCode: HttpStatus.REQUEST_TIMEOUT,
        message: `Verify code was expired`,
      };
    }
    try {
      const remainingInput = --OTPCached.remainingInput;
      if (remainingInput <= 0) {
        await this.cacheManager.del(userReq.phoneNumber);
        await this.userService.updateStatusUserByUserId(
          userReq.id,
          UserStatus.BANNED,
        );
        return {
          message: `Your phone was blocked for this site. Contact: ${this.configService.getConfig(
            'MAILER',
          )} for more information.`,
        };
      }
      const serviceSid = this.configService.getConfig(
        'TWILIO_VERIFICATION_SERVICE_SID',
      );
      const result = await this.twilioClient.verify
        .services(serviceSid)
        .verificationChecks.create({
          to: userReq.phoneNumber,
          code: codeInput,
        });
      if (!result.valid || result.status !== 'approved') {
        await this.cacheManager.set(
          userReq.phoneNumber,
          {
            code: OTPCached.code,
            remainingInput,
          },
          { ttl: EXPIRED_CODE_FIVE_MINUTES },
        );
        throw new BadRequestException({
          message: `OTP code is wrong. You have ${remainingInput} times to input`,
          data: {
            remainingTime: remainingInput,
          },
        });
      }
      await this.userService.updateStatusUserByUserId(
        userReq.id,
        UserStatus.NEW,
      );
      await this.cacheManager.del(userReq.phoneNumber);
      return { data: 'success' };
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }
}
