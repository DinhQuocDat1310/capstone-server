import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiFoundResponse,
  ApiOkResponse,
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
  @ApiOkResponse({
    status: 200,
    description: 'Login success',
  })
  @ApiFoundResponse({
    status: 403,
    description: 'Your account was block',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Invalid Credentials',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'You need verify your email or phoneNumber',
  })
  @ApiOperation({ summary: 'Signin for user' })
  async signIn(@Body() dto: SignInDto) {
    return await this.authService.signInUser(dto);
  }
}
