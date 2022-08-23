import { VerifyDto } from './dto';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EmailsService } from './service';

@Controller('email')
@ApiTags('Email')
export class EmailsController {
  constructor(private readonly emailService: EmailsService) {}
  @Post('/verify')
  @ApiBody({ type: VerifyDto })
  @ApiResponse({
    status: 202,
    description: 'Verified code accepted',
  })
  @ApiResponse({
    status: 409,
    description: 'Your code wrong',
  })
  @ApiResponse({
    status: 408,
    description: 'Your code expired',
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
