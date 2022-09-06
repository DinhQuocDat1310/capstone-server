import { Body, Controller, HttpCode, Post, HttpStatus } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignInDto } from './dto/signIn.dto';
import { AuthService } from './service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @ApiBody({ type: SignInDto })
  @ApiUnauthorizedResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid email/phoneNumber or password',
  })
  @ApiForbiddenResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Your account was block. Contact Admin',
  })
  @ApiAcceptedResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Login success',
  })
  @ApiOperation({ summary: 'Signin for user' })
  @HttpCode(HttpStatus.ACCEPTED)
  async signIn(@Body() dto: SignInDto) {
    return await this.authService.signInUser(dto);
  }
}
