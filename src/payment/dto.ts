import { CampaignStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class TransactionCampaignDTO {
  @ApiProperty({
    description: 'campaign id',
    default: 'uuid',
  })
  campaignId: string;

  @IsEnum([CampaignStatus.PAYMENT, CampaignStatus.FINISH], {
    message: 'Status campaign must be: [PAYMENT, FINISH]',
  })
  @ApiProperty({
    enum: [CampaignStatus.PAYMENT, CampaignStatus.FINISH],
    description: 'Status campaign',
  })
  statusCampaign: CampaignStatus;
}
