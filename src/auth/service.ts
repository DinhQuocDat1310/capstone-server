import { Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/user/service';
import { UserSignIn } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signInUser(user: UserSignIn) {
    const payload = {
      sub: user.id,
      username: user.role === 'DRIVER' ? user.phoneNumber : user.email,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findUserByEmailOrPhoneNumber(
      username,
      username,
    );
    if (user && (await compare(password, user.password))) {
      return user;
    }
    return null;
  }
}
