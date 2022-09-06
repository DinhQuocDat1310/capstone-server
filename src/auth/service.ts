import { AppConfigService } from 'src/config/appConfigService';
import { SignInDto } from './dto/signIn.dto';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
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
    await this.usersService.checkPermissionUser(user.status);
    if (!user) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Your email/phonenumber or password is not valid',
      });
    }
    const isEqualPassword = await compare(password, user.password);
    if (!isEqualPassword) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Your email/phonenumber or password is not valid',
      });
    }
    const payloadSub = user.id;
    const payloadBaseRole =
      user.role === 'BRAND' || user.role === 'MANAGER' || user.role === 'ADMIN'
        ? user.email
        : user.phoneNumber;
    const accessToken: string = this.jwtService.sign({
      data: {
        payloadSub,
        payloadBaseRole,
      },
    });
    const dataBrand = await this.usersService.findBrandByUserId(user.id);
    if (!dataBrand.brand) {
      return {
        accessToken: accessToken,
        role: user.role,
      };
    }
    return {
      accessToken: accessToken,
      role: user.role,
      brandName: dataBrand.brand.brandName,
    };
  }
}
