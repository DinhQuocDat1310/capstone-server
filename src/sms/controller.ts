import { VerifySMSDto } from './dto';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SmsService } from './service';
import { RequestUser } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Role, UserStatus } from '@prisma/client';
import { Roles, Status } from 'src/guard/decorators';
import { StatusGuard } from 'src/guard/userStatus.guard';

@Controller('sms')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiTags('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiOperation({ summary: 'Send OTP' })
  @HttpCode(200)
  @Roles(Role.DRIVER)
  @Status(UserStatus.INIT)
  @Post('/otp/generate')
  async createPhoneVerification(@Request() req: RequestUser) {
    return await this.smsService.sendOTP(req.user);
  }

  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiBody({ type: VerifySMSDto })
  @ApiOperation({ summary: 'Verify OTP' })
  @HttpCode(200)
  @Roles(Role.DRIVER)
  @Status(UserStatus.INIT)
  @Post('/otp/verify')
  async verifyOTPPhoneNumber(
    @Request() req: RequestUser,
    @Body() dto: VerifySMSDto,
  ) {
    return await this.smsService.verifyOTP(req.user, dto.otpCode);
  }
}
