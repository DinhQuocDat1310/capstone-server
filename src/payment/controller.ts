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
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequestUser } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { TransactionDTO } from './dto';
import { PaymentService } from './service';
import { Roles } from 'src/guard/decorators';
import { Role } from '@prisma/client';

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

  @ApiOperation({ summary: 'View all transaction' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
  @Roles(Role.BRAND)
  @Get('/transactions')
  async viewAllTransaction(@Request() req: RequestUser) {
    return await this.paymentService.viewAllTransaction(req.user);
  }
}
