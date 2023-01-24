import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AppConfigService } from 'src/config/appConfigService';
import { UserSignIn } from '../dto';
import { AuthService } from '../service';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: AppConfigService,
  ) {
    super();
  }

  async validate(username: string, password: string): Promise<UserSignIn> {
    const user = await this.authService.validateUser(username, password);
    if (!user)
      throw new UnauthorizedException(
        'Login failed: email/phone number or password is incorrect.',
      );
    if (!user.isActive)
      throw new ForbiddenException(
        `Account is disabled, Please contact: ${this.configService.getConfig(
          'MAILER',
        )}  more information.`,
      );
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      address: user.address,
    };
  }
}
