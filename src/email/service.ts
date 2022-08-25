import { BrandsService } from './../brand/service';
import { MailerService } from '@nestjs-modules/mailer';
import {
  CACHE_MANAGER,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';
import { EXPIRED_CODE_EMAIL_FIVE_MINUTES } from 'src/constants/cache-code';
import { UsersService } from 'src/user/service';
import { VerifyDto } from './dto';
import { AppConfigService } from 'src/config/appConfigService';

@Injectable()
export class EmailsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailerService: MailerService,
    private readonly userService: UsersService,
    private readonly configService: AppConfigService,
    private readonly brandService: BrandsService,
  ) {}

  async sendVerifyCodeToEmail(receiverEmail: string) {
    const code = Math.floor(100000 + Math.random() * 900000);
    const user = await this.userService.findUserByEmail(receiverEmail);
    if (!user) throw new NotFoundException(`user not found: ${receiverEmail}`);

    const brand = await this.brandService.findBrandByUserId(user.id);
    if (!brand)
      throw new UnauthorizedException(
        `this user ${receiverEmail} is not register brand yet`,
      );

    if (user.status !== 'INIT') {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: `Cannot Request to Verify code for this account. Please contact: ${this.configService.getConfig(
          'MAILER',
        )} for more information.`,
      };
    }

    const codeCached: { code: number; remainingInput: number } =
      await this.cacheManager.get(receiverEmail);
    if (codeCached) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          'We have sent the code to your email. Please try again in a few minutes',
      };
    }

    await this.cacheManager.set(
      receiverEmail,
      {
        code,
        remainingInput: 5,
      },
      { ttl: EXPIRED_CODE_EMAIL_FIVE_MINUTES },
    );
    await this.mailerService.sendMail({
      to: receiverEmail,
      from: this.configService.getConfig('MAILER'),
      subject: 'Your verify code for Brandvertise',
      html: `
      <h1 style="color: green">Hello ${brand.brandName},</h1></br>
      <p>Thanks for become Brandvertise's partner!</p>
      <p>Enter Code: <b>${code}</b> in the app to verify your Email. Your code <b>expired in 5 minutes</b> later.</p></br>
      <p>Regards,</p>
      <p style="color: green">Brandvertise</p>
      `,
    });
    return {
      statusCode: HttpStatus.OK,
      timeExpiredInSecond: EXPIRED_CODE_EMAIL_FIVE_MINUTES,
    };
  }

  async checkValidationCode({ codeInput, email }: VerifyDto) {
    const codeCached: { code: number; remainingInput: number } =
      await this.cacheManager.get(email);
    if (!codeCached) {
      return {
        statusCode: HttpStatus.REQUEST_TIMEOUT,
        message: `Verify code was expired`,
      };
    }
    if (codeCached.code !== codeInput) {
      const remainingInput = --codeCached.remainingInput;
      if (remainingInput == 0) {
        await this.cacheManager.del(email);
        await this.userService.updateStatusUserByEmail(
          email,
          UserStatus.BANNED,
        );
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message: `Your email was blocked for this site. Contact: ${this.configService.getConfig(
            'MAILER',
          )} for more information.`,
        };
      }
      await this.cacheManager.set(
        email,
        {
          code: codeCached.code,
          remainingInput,
        },
        { ttl: EXPIRED_CODE_EMAIL_FIVE_MINUTES },
      );
      return {
        statusCode: HttpStatus.CONFLICT,
        message: `Verified code is wrong. You have ${remainingInput} time(s) reminder to input.`,
        data: remainingInput,
      };
    }
    await this.userService.updateStatusUserByEmail(email, UserStatus.NEW);
    await this.cacheManager.del(email);
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Verified email successful',
    };
  }
}
