import { JwtPayload } from './dto/jwt-payload';
import { SignInDto } from './dto/signIn.dto';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/service';
import { UsersService } from 'src/user/service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signInUser(dto: SignInDto) {
    const { password } = dto;
    const user = await this.usersService.findUserByCredentials(
      dto.email,
      dto.phoneNumber,
    );
    const isEqualPassword = await compare(password, user.password);
    if (!user && !isEqualPassword) {
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
