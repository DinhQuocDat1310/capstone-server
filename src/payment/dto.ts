import { ApiProperty } from '@nestjs/swagger';

export class TransactionDTO {
  @ApiProperty({
    description: 'User Id',
    default: 'uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Amount request',
  })
  amount: string;
}

export class VerifyPaymentDTO {
  @ApiProperty({
    description: 'Code input',
  })
  codeInput: string;

  @ApiProperty({
    description: 'Campaign ID',
  })
  campaignId: string;
}
