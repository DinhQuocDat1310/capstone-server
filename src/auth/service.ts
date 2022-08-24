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
        errorMessage: 'Invalid Credentials',
      });
    }
    if (user.status === 'BANNED') {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        errorMessage: 'Your account was blocked.',
      });
    }
    if (user.status === 'INIT') {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        errorMessage: 'You need verify your email or phone number',
      });
    }
    const isEqualPassword = await compare(password, user.password);
    if (!isEqualPassword) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        errorMessage: 'Invalid Credentials',
      });
    }
    const payload: JwtPayload = { email: user.email, sub: user.id };
    const accessToken: string = this.jwtService.sign(payload);
    return { accessToken: accessToken, role: user.role };
  }
}
