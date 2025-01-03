import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, IsUrl, Matches } from 'class-validator';
export class CampaignVerifyInformationDTO {
  @ApiProperty({
    description: 'Id route',
  })
  @IsString()
  routeId: string;

  @ApiProperty({
    description: 'Id Wrap',
  })
  @IsString()
  idWrap: string;

  @ApiProperty({
    description: 'Price wrap',
  })
  priceWrap: string;

  @ApiProperty({
    description: 'Name of Campaign',
  })
  @IsString()
  campaignName: string;

  @ApiProperty({
    description: `Start running date`,
  })
  @Matches(/([1-9]|1[012])[/]([1-9]|[12][0-9]|3[01])[/](19|20)[0-9]{2}/, {
    message: 'Start running date must be format MM/DD/YYYY',
  })
  startRunningDate: string;

  @ApiProperty({
    description: 'Duration running Campaign',
  })
  duration: string;

  @ApiProperty({
    description: 'Total km',
  })
  totalKm: string;

  @ApiProperty({
    description: 'Quantity drivers',
  })
  quantityDriver: string;

  @ApiProperty({
    description: 'Description for campaign',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'URL image of image Poster',
    default: 'image.com',
  })
  @IsUrl(undefined)
  poster: string;
}

export class CampaignContractDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'ID of request verify account' })
  verifyId: string;

  @ApiProperty({
    description: `Date open register`,
  })
  @Matches(/([1-9]|1[012])[/]([1-9]|[12][0-9]|3[01])[/](19|20)[0-9]{2}/, {
    message: 'Date open register must be format MM/DD/YYYY',
  })
  dateOpenRegister: string;

  @ApiProperty({
    description: `Date payment deposit`,
  })
  @Matches(/([1-9]|1[012])[/]([1-9]|[12][0-9]|3[01])[/](19|20)[0-9]{2}/, {
    message: 'Date payment deposit must be format MM/DD/YYYY',
  })
  startDatePayment: string;

  @ApiProperty({
    description: `Date wrap`,
  })
  @Matches(/([1-9]|1[012])[/]([1-9]|[12][0-9]|3[01])[/](19|20)[0-9]{2}/, {
    message: 'Date warp sticket must be format MM/DD/YYYY',
  })
  startDateWrap: string;
}

export class StepsCampaignDTO {
  @ApiProperty({ description: 'Step Campaign' })
  step: string;

  @ApiProperty({ description: 'id campaign' })
  campaignId: string;
}
