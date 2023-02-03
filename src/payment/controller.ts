import { StatusGuard } from 'src/guard/userStatus.guard';
import {
  All,
  Body,
  Controller,
  Param,
  Post,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequestUser } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { TransactionDTO, VerifyPaymentDTO } from './dto';
import { PaymentService } from './service';
import { Roles, Status } from 'src/guard/decorators';
import { Role, StatusUser } from '@prisma/client';

@Controller('payment')
@ApiTags('Payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Create Transaction Paypal' })
  @ApiBody({ type: TransactionDTO })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiCreatedResponse({ description: 'Created' })
  @Post('/orders')
  async createTransaction(@Body() dto: TransactionDTO) {
    return await this.paymentService.createOrder(dto);
  }

  @ApiOperation({ summary: 'Checkout transaction' })
  @Post('/orders/:orderId/capture/:userId')
  async captureTransaction(
    @Param('orderId') orderId: string,
    @Param('userId') userId: string,
  ) {
    return await this.paymentService.captureTransaction(orderId, userId);
  }

  @All('/webhook')
  async handleCallback(@Body() dto: any) {
    return await this.paymentService.handleAllWebhook(dto);
  }

  @ApiOperation({ summary: 'Check Wallet' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiCreatedResponse({ description: 'Created' })
  @Status(StatusUser.VERIFIED)
  @Roles(Role.BRAND)
  @Post('/check-wallet')
  async checkWalletToAcceptContract(@Request() req: RequestUser) {
    return await this.paymentService.checkWalletAcceptContract(req.user.id);
  }

  @ApiOperation({ summary: 'View all transaction' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
  @Roles(Role.BRAND)
  @Status(StatusUser.VERIFIED)
  @Get('/transactions')
  @ApiBearerAuth('access-token')
  async viewAllTransaction(@Request() req: RequestUser) {
    return await this.paymentService.viewAllTransaction(req.user);
  }

  @ApiOperation({ summary: 'Checkout campaign' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: VerifyPaymentDTO })
  @UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
  @Roles(Role.BRAND)
  @Status(StatusUser.VERIFIED)
  @Post('/checkout')
  @ApiBearerAuth('access-token')
  async checkoutCampaign(
    @Request() req: RequestUser,
    @Body() dto: VerifyPaymentDTO,
  ) {
    return await this.paymentService.verifyOTPCheckout(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Send OTP to checkout payment' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
  @Roles(Role.BRAND)
  @Status(StatusUser.VERIFIED)
  @Get('/verify/:campaignId')
  @ApiBearerAuth('access-token')
  async verifyCheckoutCampaign(
    @Request() req: RequestUser,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.paymentService.sendOTPCheckout(req.user.id, campaignId);
  }
}
