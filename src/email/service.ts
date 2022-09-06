import { JwtService } from '@nestjs/jwt';
import { BrandsService } from './../brand/service';
import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  CACHE_MANAGER,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { Cache } from 'cache-manager';
import { UsersService } from 'src/user/service';
import { VerifyDto } from './dto';
import { AppConfigService } from 'src/config/appConfigService';
import { EXPIRED_CODE_FIVE_MINUTES } from 'src/constants/cache-code';

@Injectable()
export class EmailsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailerService: MailerService,
    private readonly userService: UsersService,
    private readonly configService: AppConfigService,
    private readonly brandService: BrandsService,
    private readonly jwtService: JwtService,
  ) {}

  async sendVerifyCodeToEmail(receiverEmail: string) {
    const code = Math.floor(100000 + Math.random() * 900000);
    const user = await this.userService.findUserByEmail(receiverEmail);
    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User not found: ${receiverEmail}`,
      });
    }
    const brand = await this.brandService.findBrandByUserId(user.id);
    if (!brand) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `This user ${receiverEmail} is not register brand yet`,
      });
    }
    if (user.status !== 'INIT') {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `Cannot Request to Verify code for this account. Please contact: ${this.configService.getConfig(
          'MAILER',
        )} for more information.`,
      });
    }

    const codeCached: { code: number; remainingInput: number } =
      await this.cacheManager.get(receiverEmail);
    if (codeCached) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          'We have sent the code to your email. Please try again in a few minutes.',
      });
    }

    await this.cacheManager.set(
      receiverEmail,
      {
        code,
        remainingInput: 5,
      },
      { ttl: EXPIRED_CODE_FIVE_MINUTES },
    );
    await this.mailerService.sendMail({
      to: receiverEmail,
      from: this.configService.getConfig('MAILER'),
      subject: 'Your verify code for Brandvertise',
      html: `
      <h1 style="color: green">Hello ${brand.brandName},</h1></br>
      <p>Thanks for becoming Brandvertise's partner!</p>
      <p>Enter Code: <b>${code}</b> in the app to verify your Email. Your code <b>expired in 5 minutes</b> later.</p></br>
      <p>Regards,</p>
      <p style="color: green">Brandvertise</p>
      `,
    });
    return {
      statusCode: HttpStatus.OK,
      timeExpiredInSecond: EXPIRED_CODE_FIVE_MINUTES,
    };
  }

  async checkValidationCode({ codeInput, email }: VerifyDto) {
    const codeCached: { code: number; remainingInput: number } =
      await this.cacheManager.get(email);
    if (!codeCached) {
      throw new RequestTimeoutException({
        statusCode: HttpStatus.REQUEST_TIMEOUT,
        message: `Verify code was expired`,
      });
    }
    if (codeCached.code !== codeInput) {
      const remainingInput = --codeCached.remainingInput;
      if (remainingInput == 0) {
        await this.cacheManager.del(email);
        await this.userService.updateStatusUserByEmail(
          email,
          UserStatus.BANNED,
        );
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: `Cannot Request to Verify code for this account. Please contact: ${this.configService.getConfig(
            'MAILER',
          )} for more information.`,
        });
      }
      await this.cacheManager.set(
        email,
        {
          code: codeCached.code,
          remainingInput,
        },
        { ttl: EXPIRED_CODE_FIVE_MINUTES },
      );
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Verified code is wrong. You have ${remainingInput} time(s) reminder to input.`,
        data: remainingInput,
      });
    }
    const user = await this.userService.findUserByEmail(email);
    const payload = { email: email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '3600',
    });
    await this.userService.updateStatusUserByEmail(email, UserStatus.NEW);
    await this.cacheManager.del(email);
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Verified email successful',
      accessToken,
    };
  }
}
