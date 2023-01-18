import { All, Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionDTO } from './dto';
import { PaymentService } from './service';

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
}
