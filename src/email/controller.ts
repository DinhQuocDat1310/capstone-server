import { VerifyDto } from './dto';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
  @Post('/verify')
  @ApiBody({ type: VerifyDto })
  @ApiAcceptedResponse({
    status: 202,
    description: 'Verified code accepted',
  })
  @ApiConflictResponse({
    status: 409,
    description: 'Your code wrong',
  })
  @ApiRequestTimeoutResponse({
    status: 408,
    description: 'Your code expired',
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Your account was blocked',
  })
  @ApiOperation({ summary: 'Check valid code' })
  async inputCodeVerifyEmail(@Body() verifyEmail: VerifyDto) {
    return await this.emailService.checkValidationCode(verifyEmail);
  }

  @Get('/otp/:email')
  @ApiOkResponse({
    status: 200,
    description: 'Send code to email success.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Failed send code to email.',
  })
  @ApiOperation({ summary: 'Send code to email' })
  async sendOtpToEmail(@Param('email') email: string) {
    return await this.emailService.sendVerifyCodeToEmail(email);
  }
}
