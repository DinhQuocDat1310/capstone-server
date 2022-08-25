import { VerifySMSDto } from './dto';
import { UsersService } from 'src/user/service';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  MethodNotAllowedException,
} from '@nestjs/common';
import { AppConfigService } from 'src/config/appConfigService';
import { Twilio } from 'twilio';
import { UserStatus } from '@prisma/client';

@Injectable()
export class SmsService {
  private readonly twilioClient: Twilio;
  constructor(
    private readonly configService: AppConfigService,
    private readonly usersService: UsersService,
  ) {
    const accountSid = configService.getConfig('TWILIO_ACCOUNT_SID');
    const authToken = configService.getConfig('TWILIO_AUTH_TOKEN');
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendPhoneVerification(phoneNumber: string) {
    const user = await this.usersService.findUserByCredentials('', phoneNumber);
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
        };
      }
    } catch (error) {
      if (error.code === 20429) {
        throw new MethodNotAllowedException({
          statusCode: HttpStatus.METHOD_NOT_ALLOWED,
          message: 'Too many request',
        });
      }
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Phone number format: +84xxxxxxxxx',
      };
    }
  }

  async confirmPhoneNumber(verifySMSDto: VerifySMSDto) {
    const { phoneNumber, otpCode } = verifySMSDto;
    const user = await this.usersService.findUserByCredentials('', phoneNumber);
    if (user.status !== 'INIT') {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: `Cannot request to verify phone number. Please contact: ${this.configService.getConfig(
          'MAILER',
        )} for more information.`,
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
        throw new BadRequestException({
          message: 'Wrong OTP provide',
        });
      }
      await this.usersService.updateUserStatusByPhone(
        phoneNumber,
        UserStatus.NEW,
      );
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'Verified phone number successful',
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Wrong OTP provide',
      });
    }
  }
}
