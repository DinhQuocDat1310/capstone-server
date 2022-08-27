import { VerifySMSDto } from './dto';
import { UsersService } from 'src/user/service';
import {
  BadRequestException,
  CACHE_MANAGER,
  HttpStatus,
  Inject,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { AppConfigService } from 'src/config/appConfigService';
import { Twilio } from 'twilio';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';
import { EXPIRED_CODE_FIVE_MINUTES } from 'src/constants/cache-code';

@Injectable()
export class SmsService {
  private readonly twilioClient: Twilio;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: AppConfigService,
    private readonly usersService: UsersService,
  ) {
    const accountSid = configService.getConfig('TWILIO_ACCOUNT_SID');
    const authToken = configService.getConfig('TWILIO_AUTH_TOKEN');
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendPhoneVerification(phoneNumber: string) {
    const user = await this.usersService.findUserByCredentials('', phoneNumber);
    if (!user)
      throw new NotFoundException(`User not signup yet: ${phoneNumber}`);
    if (user) {
      if (user.status !== 'INIT') {
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message: `Cannot request to verify phone number. Please contact: ${this.configService.getConfig(
            'MAILER',
          )} for more information.`,
        };
      }
    }
    try {
      const serviceSid = this.configService.getConfig(
        'TWILIO_VERIFICATION_SERVICE_SID',
      );
      const OTPCached: { code: string; remainingInput: number } =
        await this.cacheManager.get(phoneNumber);
      if (OTPCached) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'We have sent the OTP to your phone. Please try again in a few minutes',
        };
      }
      await this.cacheManager.set(
        phoneNumber,
        {
          remainingInput: 5,
        },
        { ttl: EXPIRED_CODE_FIVE_MINUTES },
      );
      const result = await this.twilioClient.verify
        .services(serviceSid)
        .verifications.create({
          to: phoneNumber,
          channel: 'sms',
          locale: 'en',
        });
      if (result) {
        return {
          statusCode: HttpStatus.OK,
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
      console.log(error.message);
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Phone number format: +84xxxxxxxxx',
      };
    }
  }

  async confirmPhoneNumber(verifySMSDto: VerifySMSDto) {
    const { phoneNumber, otpCode } = verifySMSDto;
    const OTPCached: { code: string; remainingInput: number } =
      await this.cacheManager.get(phoneNumber);
    if (!OTPCached) {
      return {
        statusCode: HttpStatus.REQUEST_TIMEOUT,
        message: `Verify code was expired`,
      };
    }
    const serviceSid = this.configService.getConfig(
      'TWILIO_VERIFICATION_SERVICE_SID',
    );
    try {
      const result = await this.twilioClient.verify
        .services(serviceSid)
        .verificationChecks.create({ to: phoneNumber, code: otpCode });
      if (!result.valid || result.status !== 'approved') {
        const remainingInput = --OTPCached.remainingInput;
        if (remainingInput == 0) {
          await this.cacheManager.del(phoneNumber);
          await this.usersService.updateUserStatusByPhone(
            phoneNumber,
            UserStatus.BANNED,
          );
          return {
            statusCode: HttpStatus.FORBIDDEN,
            message: `Your phone was blocked for this site. Contact: ${this.configService.getConfig(
              'MAILER',
            )} for more information.`,
          };
        }
        await this.cacheManager.set(
          phoneNumber,
          {
            code: OTPCached.code,
            remainingInput,
          },
          { ttl: EXPIRED_CODE_FIVE_MINUTES },
        );
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `OTP code is wrong. You have ${remainingInput} times to input`,
          data: remainingInput,
        };
      }
      await this.usersService.updateUserStatusByPhone(
        phoneNumber,
        UserStatus.NEW,
      );
      await this.cacheManager.del(phoneNumber);
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'Verified phone number successful',
      };
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }
}
