import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';
import { UsersService } from 'src/user/service';
import { AppConfigService } from 'src/config/appConfigService';
import { EXPIRED_CODE_FIVE_MINUTES } from 'src/constants/cache-code';
import { UserSignIn } from 'src/auth/dto';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailerService: MailerService,
    private readonly userService: UsersService,
    private readonly configService: AppConfigService,
  ) {}

  async sendOTP(userReq: UserSignIn) {
    const code = Math.floor(100000 + Math.random() * 900000);
    const user = await this.userService.getUserBrandInfo(
      userReq.email,
      userReq.role,
    );
    const codeCached: { code: string; remainingInput: number } =
      await this.cacheManager.get(user.email);
    if (codeCached) {
      throw new BadRequestException(
        'We have sent the code to your email. Please try again in a few minutes.',
      );
    }

    await this.cacheManager.set(
      user.email,
      {
        code: code.toString(),
        remainingInput: 5,
      },
      { ttl: EXPIRED_CODE_FIVE_MINUTES },
    );
    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.getConfig('MAILER'),
      subject: 'Your verify code for Brandvertise',
      html: `
      <h1 style="color: green">Hello ${user.brand.brandName},</h1></br>
      <p>Thanks for becoming Brandvertise's partner!</p>
      <p>Enter Code: <b>${code}</b> in the app to verify your Email. Your code <b>expired in 5 minutes</b> later.</p></br>
      <p>Regards,</p>
      <p style="color: green">Brandvertise</p>
      `,
    });
    return {
      timeExpiredInSecond: EXPIRED_CODE_FIVE_MINUTES,
    };
  }

  async VerifyOTP(userReq: UserSignIn, codeInput: string) {
    const codeCached: { code: string; remainingInput: number } =
      await this.cacheManager.get(userReq.email);
    if (!codeCached) {
      throw new BadRequestException({
        message: `Verify code was expired. Please generate a new OTP`,
      });
    }
    if (codeCached.code !== codeInput) {
      const remainingInput = --codeCached.remainingInput;
      if (remainingInput <= 0) {
        await this.cacheManager.del(userReq.email);
        await this.userService.updateStatusUserByUserId(
          userReq.id,
          UserStatus.BANNED,
        );
        throw new BadRequestException({
          message: `Your account is banned. Please contact: ${this.configService.getConfig(
            'MAILER',
          )} for more information.`,
        });
      }
      await this.cacheManager.set(
        userReq.email,
        {
          code: codeCached.code,
          remainingInput,
        },
        { ttl: EXPIRED_CODE_FIVE_MINUTES },
      );
      throw new BadRequestException({
        message: `Verified code is wrong. You have ${remainingInput} time(s) reminder to input.`,
        data: {
          remainTime: remainingInput,
        },
      });
    }
    await this.userService.updateStatusUserByUserId(userReq.id, UserStatus.NEW);
    await this.cacheManager.del(userReq.email);
    return {
      message: 'Verified',
    };
  }

  async sendNotificationVerifyAccountToBrandEmail(
    email: string,
    subject: string,
    content: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      from: this.configService.getConfig('MAILER'),
      subject,
      html: content,
    });
    this.logger.debug(
      `Send notification verify account to ${email} successful!`,
    );
  }
}
