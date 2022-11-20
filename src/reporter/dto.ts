import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateReportDriverCampaignDTO {
  @ApiProperty({
    description: 'URL image of image car back',
    default: 'image.com',
  })
  @IsUrl(undefined)
  imageCarBack: string;

  @ApiProperty({
    description: 'URL image of image car left',
    default: 'image.com',
  })
  @IsUrl(undefined)
  imageCarLeft: string;

  @ApiProperty({
    description: 'URL image of image car right',
    default: 'image.com',
  })
  @IsUrl(undefined)
  imageCarRight: string;

  @ApiProperty({
    description: 'URL image of image car odometer',
    default: 'image.com',
  })
  @IsOptional()
  @IsUrl(undefined)
  imageCarOdo?: string;

  @ApiProperty({
    description: 'Driver join campaign id',
  })
  @IsString()
  driverJoinCampaignId: string;
}
