import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StatusUser } from '@prisma/client';
import { Status } from 'src/guard/decorators';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { RequestUser } from './dto';
import { SignInDto } from './dto/index';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './service';

@Controller('auth')
@UseGuards(LocalAuthGuard, StatusGuard)
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Signin for user' })
  @ApiBody({ type: SignInDto })
  @ApiUnauthorizedResponse({
    description: 'Login failed: email/phone number or password is incorrect.',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @ApiOkResponse({ description: 'Login successful' })
  @HttpCode(HttpStatus.OK)
  @Status(
    StatusUser.INIT,
    StatusUser.NEW,
    StatusUser.PENDING,
    StatusUser.UPDATE,
    StatusUser.VERIFIED,
  )
  @Post('/login')
  async login(@Request() req: RequestUser) {
    return await this.authService.signInUser(req.user);
  }
}
