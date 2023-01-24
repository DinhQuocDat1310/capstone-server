import { VerifyDto } from './dto';
import { Body, Post, UseGuards, Request, Controller } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EmailsService } from './service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { RequestUser } from 'src/auth/dto';
import { Roles, Status } from 'src/guard/decorators';
import { Role, StatusUser } from '@prisma/client';

@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiBearerAuth('access-token')
@ApiTags('Email')
export class EmailsController {
  constructor(private readonly emailService: EmailsService) {}

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'ok' })
  @Roles(Role.BRAND)
  @Status(StatusUser.INIT)
  @Post('/brand/otp/generate')
  @ApiOperation({ summary: 'Send code to email' })
  async sendOtpToBrandEmail(@Request() req: RequestUser) {
    return await this.emailService.sendBrandOTP(req.user);
  }

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'ok' })
  @Roles(Role.DRIVER)
  @Status(StatusUser.INIT)
  @Post('/driver/otp/generate')
  @ApiOperation({ summary: 'Send code to email' })
  async sendOtpToDriverEmail(@Request() req: RequestUser) {
    return await this.emailService.sendDriverOTP(req.user);
  }

  @ApiBody({ type: VerifyDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOperation({ summary: 'Verify email' })
  @Roles(Role.BRAND, Role.DRIVER)
  @Status(StatusUser.INIT)
  @Post('/otp/verify')
  async inputCodeVerifyEmail(
    @Request() req: RequestUser,
    @Body() dto: VerifyDto,
  ) {
    return await this.emailService.VerifyOTP(req.user, dto.codeInput);
  }
}
