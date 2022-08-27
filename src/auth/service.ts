import { AppConfigService } from 'src/config/appConfigService';
import { JwtPayload } from './dto/jwt-payload';
import { SignInDto } from './dto/signIn.dto';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly appConfigService: AppConfigService,
  ) {}

  async signInUser(dto: SignInDto) {
    const { password } = dto;
    const user = await this.usersService.findUserByCredentials(
      dto.email,
      dto.phoneNumber,
    );
    if (!user) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Your email/phonenumber or password is not valid',
      });
    }
    if (user.status === 'BANNED') {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `Your account was banned. Please Contact Contact: ${this.appConfigService.getConfig(
          'MAILER',
        )} for more information.`,
      });
    }
    if (user.status === 'INIT') {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'You need verify your email or phone number',
      });
    }
    const isEqualPassword = await compare(password, user.password);
    if (!isEqualPassword) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Your email/phonenumber or password is not valid',
      });
    }
    const payload: JwtPayload = { email: user.email, sub: user.id };
    const accessToken: string = this.jwtService.sign(payload);
    const dataBrand = await this.usersService.findBrandByUserId(user.id);
    return {
      accessToken: accessToken,
      role: user.role,
      brandName: dataBrand.brand.brandName,
    };
  }
}
