import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';

export class CampaignVerifyInformationDTO {
  @ApiProperty({
    description: 'Id location',
  })
  @IsString()
  idLocation: string;

  @ApiProperty({
    description: 'Id Wrap',
  })
  @IsString()
  idWrap: string;

  @ApiProperty({
    description: 'Price location',
  })
  @IsNumberString()
  priceLocation: string;

  @ApiProperty({
    description: 'Price wrap',
  })
  @IsNumberString()
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
  @IsNumberString()
  duration: string;

  @ApiProperty({
    description: 'Total km',
  })
  @IsNumberString()
  totalKm: string;

  @ApiProperty({
    description: 'Quantity drivers',
  })
  @IsNumberString()
  quantityDriver: string;

  @ApiProperty({
    description: 'Description for campaign',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Minimum km must drive/day',
  })
  @IsNumberString()
  minimumKmDrive: string;

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
  datePaymentDeposit: string;

  @ApiProperty({
    description: `Date wrap sticket`,
  })
  @Matches(/([1-9]|1[012])[/]([1-9]|[12][0-9]|3[01])[/](19|20)[0-9]{2}/, {
    message: 'Date warp sticket must be format MM/DD/YYYY',
  })
  dateWarpSticket: string;
}
