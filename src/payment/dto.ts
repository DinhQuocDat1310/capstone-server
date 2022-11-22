import { TypePayment } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class TransactionCampaignDTO {
  @ApiProperty({
    description: 'campaign id',
    default: 'uuid',
  })
  campaignId: string;

  @IsEnum([TypePayment.PREPAY, TypePayment.POSTPAID], {
    message: 'Type payment must be: [PREPAY, POSTPAID]',
  })
  @ApiProperty({
    enum: [TypePayment.PREPAY, TypePayment.POSTPAID],
    description: 'Type payment',
  })
  typePayment: TypePayment;
}
