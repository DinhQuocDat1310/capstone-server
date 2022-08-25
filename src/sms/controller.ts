import { VerifySMSDto } from './dto';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SmsService } from './service';

@Controller('sms')
@ApiTags('Sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Get('/otp/:phone')
  @ApiOkResponse({
    status: 200,
    description: 'Send code to phone number success.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Failed send code to email.',
  })
  @ApiFoundResponse({
    status: 403,
    description: 'Fail to verify your phone number',
  })
  @ApiBadRequestResponse({
    status: 405,
    description: 'Too many request',
  })
  @ApiOperation({ summary: 'Send code to phone number' })
  async createPhoneVerification(@Param('phone') phone: string) {
    return await this.smsService.sendPhoneVerification(phone);
  }

  @Post('/verify')
  @ApiOkResponse({
    status: 200,
    description: 'Verify phone number success',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Wrong OTP provide',
  })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Cannot request verify phone number',
  })
  @ApiBody({ type: VerifySMSDto })
  @ApiOperation({ summary: 'Send code to phone number' })
  async verifyOTPPhoneNumber(@Body() verifySMSDto: VerifySMSDto) {
    return await this.smsService.confirmPhoneNumber(verifySMSDto);
  }
}
