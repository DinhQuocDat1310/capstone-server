import { VerifyDto } from './dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiRequestTimeoutResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EmailsService } from './service';

@Controller('email')
@ApiTags('Email')
export class EmailsController {
  constructor(private readonly emailService: EmailsService) {}

  @Get('/otp/:email')
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found to send verify code',
  })
  @ApiUnauthorizedResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'This user is not register brand yet',
  })
  @ApiForbiddenResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot send verify code to email',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed send code to email',
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Send code to email success',
  })
  @ApiOperation({ summary: 'Send code to email' })
  @HttpCode(HttpStatus.OK)
  async sendOtpToEmail(@Param('email') email: string) {
    return await this.emailService.sendVerifyCodeToEmail(email);
  }

  @Post('/verify')
  @ApiBody({ type: VerifyDto })
  @ApiRequestTimeoutResponse({
    status: HttpStatus.REQUEST_TIMEOUT,
    description: 'Your code expired',
  })
  @ApiForbiddenResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Your account was blocked',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Your code wrong',
  })
  @ApiAcceptedResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Verified code accepted',
  })
  @ApiOperation({ summary: 'Check valid code' })
  @HttpCode(HttpStatus.ACCEPTED)
  async inputCodeVerifyEmail(@Body() verifyEmail: VerifyDto) {
    return await this.emailService.checkValidationCode(verifyEmail);
  }
}
