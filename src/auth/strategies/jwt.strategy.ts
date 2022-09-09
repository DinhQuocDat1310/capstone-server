import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/user/service';
import { UserSignIn } from '../dto';
import { AppConfigService } from 'src/config/appConfigService';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: AppConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }
  async validate(payload: {
    sub: string;
    username: string;
  }): Promise<UserSignIn> {
    const user = await this.userService.findUserByEmailOrPhoneNumber(
      payload.username,
      payload.username,
    );
    if (!user) throw new UnauthorizedException();
    if (!user.isActive)
      throw new ForbiddenException(
        `Account is disabled, Please contact: ${this.configService.getConfig(
          'MAILER',
        )}  more information.`,
      );
    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
    };
  }
}
