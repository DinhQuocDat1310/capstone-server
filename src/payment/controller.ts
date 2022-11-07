import { All, Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionCampaignDTO } from './dto';
import { PaymentService } from './service';

@Controller('payment')
@ApiTags('Payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Create Transaction Paypal' })
  @ApiBody({ type: TransactionCampaignDTO })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiCreatedResponse({ description: 'Created' })
  @Post('/orders')
  async createTransaction(@Body() dto: TransactionCampaignDTO) {
    return await this.paymentService.createOrder(dto.campaignId);
  }

  @ApiOperation({ summary: 'Checkout transaction' })
  @Post('/orders/:id/capture')
  async captureTransaction(@Param('id') orderId: string) {
    return await this.paymentService.capturePayment(orderId);
  }

  @All('/webhook')
  async handleCallback(@Body() dto: any) {
    return await this.paymentService.handleAllWebhook(dto);
  }
}
