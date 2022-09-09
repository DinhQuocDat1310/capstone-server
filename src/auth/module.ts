import { PrismaService } from './../prisma/service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './service';
import { UsersService } from 'src/user/service';
import { AppConfigService } from 'src/config/appConfigService';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {
        expiresIn: 3600,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    PrismaService,
    UsersService,
    AppConfigService,
  ],
})
export class AuthModule {}
