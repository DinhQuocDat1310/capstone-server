import { PrismaService } from './../prisma/service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controller';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/guard/roles.guard';
import { UsersService } from 'src/user/service';
import { AppConfigService } from 'src/config/appConfigService';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
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
    PrismaService,
    UsersService,
    AppConfigService,
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
