import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { Status } from 'src/guard/decorators';
import { RequestUser } from './dto';
import { SignInDto } from './dto/index';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './service';

@Controller('auth')
@UseGuards(LocalAuthGuard)
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Signin for user' })
  @ApiBody({ type: SignInDto })
  @ApiUnauthorizedResponse({
    description: 'Login failed: email/phone number or password is incorrect.',
  })
  @ApiForbiddenResponse({
    description:
      'Your account dont have permission. Please contact admin to support',
  })
  @ApiCreatedResponse({ description: 'Login successful' })
  @Post('/login')
  @Status(UserStatus.INIT, UserStatus.NEW, UserStatus.VERIFIED)
  async login(@Request() req: RequestUser) {
    return await this.authService.signInUser(req.user);
  }
}
