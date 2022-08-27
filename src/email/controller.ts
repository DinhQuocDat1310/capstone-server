import { VerifyDto } from './dto';
import { Body, Controller, Get, Param, Post, HttpStatus } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiRequestTimeoutResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EmailsService } from './service';

@Controller('email')
@ApiTags('Email')
export class EmailsController {
  constructor(private readonly emailService: EmailsService) {}

  @Get('/otp/:email')
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Send code to email success.',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed send code to email.',
  })
  @ApiForbiddenResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot send verify code to email',
  })
  @ApiOperation({ summary: 'Send code to email' })
  async sendOtpToEmail(@Param('email') email: string) {
    return await this.emailService.sendVerifyCodeToEmail(email);
  }

  @Post('/verify')
  @ApiBody({ type: VerifyDto })
  @ApiAcceptedResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Verified code accepted',
  })
  @ApiConflictResponse({
    status: HttpStatus.CONFLICT,
    description: 'Your code wrong',
  })
  @ApiRequestTimeoutResponse({
    status: HttpStatus.REQUEST_TIMEOUT,
    description: 'Your code expired',
  })
  @ApiForbiddenResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Your account was blocked',
  })
  @ApiOperation({ summary: 'Check valid code' })
  async inputCodeVerifyEmail(@Body() verifyEmail: VerifyDto) {
    return await this.emailService.checkValidationCode(verifyEmail);
  }
}
