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
  @Post('/orders/prepay')
  async createTransaction(@Body() dto: TransactionCampaignDTO) {
    return await this.paymentService.createOrder(dto.campaignId);
  }

  @ApiOperation({ summary: 'Checkout transaction[prepay]' })
  @Post('/orders/:orderId/capture-prepay/:campaignId')
  async capturePrepayTransaction(
    @Param('orderId') orderId: string,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.paymentService.capturePrepayTransaction(
      orderId,
      campaignId,
    );
  }

  @ApiOperation({ summary: 'Checkout transaction[postpaid]' })
  @Post('/orders/:orderId/capture-postpaid/:campaignId')
  async capturePostpaidTransaction(
    @Param('orderId') orderId: string,
    @Param('campaignId') campaignId: string,
  ) {
    return await this.paymentService.capturePrepayTransaction(
      orderId,
      campaignId,
    );
  }

  @All('/webhook')
  async handleCallback(@Body() dto: any) {
    return await this.paymentService.handleAllWebhook(dto);
  }
}
