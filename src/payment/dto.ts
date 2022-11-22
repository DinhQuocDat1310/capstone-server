import { ApiProperty } from '@nestjs/swagger';

export class TransactionCampaignDTO {
  @ApiProperty({
    description: 'campaign id',
    default: 'uuid',
  })
  campaignId: string;
}
