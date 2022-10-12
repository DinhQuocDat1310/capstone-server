import { ApiProperty } from '@nestjs/swagger';
import { PositionWarp } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsString,
  IsUrl,
} from 'class-validator';

export class CampaignVerifyInformationDTO {
  @ApiProperty({
    description: 'Name of Campaign',
  })
  @IsString()
  campaignName: string;

  @ApiProperty({
    description: `Start running date`,
  })
  @IsDateString()
  startRunningDate: Date;

  @ApiProperty({
    description: 'Duration of campaign',
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
  imagePoster: string;

  @IsEnum([PositionWarp.ONE_SIDE, PositionWarp.BOTH_SIDE], {
    message: 'Position warp must be following format: [ONE_SIDE, BOTH_SIDE]',
  })
  @ApiProperty({
    enum: [PositionWarp.ONE_SIDE, PositionWarp.BOTH_SIDE],
    description: 'Position warp',
  })
  positionWarp: PositionWarp;

  @ApiProperty({
    description: 'Location running campaign',
  })
  @IsString()
  locationName: string;
}
