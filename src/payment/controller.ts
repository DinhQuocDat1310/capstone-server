import { All, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from './service';

@Controller('payment')
@ApiTags('Payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/orders')
  async createTransaction(@Body() dto: { contractId: string }) {
    return await this.paymentService.createOrder(dto.contractId);
  }

  @Post('/orders/:id/capture')
  async captureTransaction(@Param('id') orderId: string) {
    return await this.paymentService.capturePayment(orderId);
  }

  @All('/webhook')
  async handleCallback(@Body() dto: any) {
    return await this.paymentService.handleAllWebhook(dto);
  }
}
