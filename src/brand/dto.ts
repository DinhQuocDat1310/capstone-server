import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString, IsUrl, Matches } from 'class-validator';

export class BrandVerifyInformationDTO {
  @ApiProperty({
    description: 'Name of owner brand',
  })
  @IsString()
  ownerLicenseBusiness: string;

  @ApiProperty({
    description: `brand's address`,
    default: 'Ho Chi Minh',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'phone number',
    default: '0123456789',
  })
  @Matches(/^0\d{9}$/, {
    message: 'Incorrect phone number format. Please input 10 digits',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'identity license business number',
  })
  @IsNumberString()
  idLicense: string;

  @ApiProperty({
    description: 'identity citizen number',
  })
  @IsNumberString()
  idCitizen: string;

  @ApiProperty({
    description: `Type brand's business`,
    default: 'eating',
  })
  @IsString()
  typeBusiness: string;

  @ApiProperty({
    description: 'URL image of brand logo',
    default: 'image.com',
  })
  @IsUrl(undefined)
  logo: string;

  @ApiProperty({
    description: 'URL image of the back of an identity card',
    default: 'image.com',
  })
  @IsUrl(undefined)
  imageCitizenBack: string;

  @ApiProperty({
    description: 'URL image of the front of an identity card',
    default: 'image.com',
  })
  @IsUrl(undefined)
  imageCitizenFront: string;

  @ApiProperty({
    description: 'URL image of a business license',
    default: 'image.com',
  })
  @IsUrl(undefined)
  imageLicenseBusiness: string;
}
