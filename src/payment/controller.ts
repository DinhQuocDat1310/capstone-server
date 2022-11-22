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
    return await this.paymentService.createOrder(dto);
  }

  @ApiOperation({ summary: 'Checkout transaction' })
  @Post('/orders/:orderId/capture/:campaignId')
  async captureTransaction(
    @Param('orderId') orderId: string,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.paymentService.captureTransaction(orderId, campaignId);
  }

  @All('/webhook')
  async handleCallback(@Body() dto: any) {
    return await this.paymentService.handleAllWebhook(dto);
  }
}
