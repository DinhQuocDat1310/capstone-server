import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SignInDto } from './dto/signIn.dto';
import { AuthService } from './service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 201,
    description: 'Login success',
  })
  @ApiForbiddenResponse({
    description: 'Your role forbidden for this site',
  })
  @ApiOperation({ summary: 'Signin for user' })
  async signIn(@Body() dto: SignInDto) {
    return await this.authService.signInUser(dto);
  }
}
