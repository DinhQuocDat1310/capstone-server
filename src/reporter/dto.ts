import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsUrl } from 'class-validator';

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
    description: 'Is check field',
    default: true,
  })
  @IsBoolean()
  isChecked: boolean;

  @ApiProperty({
    description: 'Driver join campaign id',
  })
  @IsString()
  driverJoinCampaignId: string;
}
