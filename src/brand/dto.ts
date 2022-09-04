import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString } from 'class-validator';

export class VerifyDataDto {
  @ApiProperty({ type: String, description: 'logo' })
  logo: string;

  @IsString()
  @ApiProperty({ type: String, description: 'fullname' })
  fullname: string;

  @IsString()
  @ApiProperty({ type: String, description: 'address' })
  address: string;

  @IsNumberString()
  @ApiProperty({ type: String, description: 'phoneNumber' })
  phoneNumber: string;

  @IsString()
  @ApiProperty({ type: String, description: 'idLicense' })
  idLicense: string;

  @IsNumberString()
  @ApiProperty({ type: String, description: 'idCardNumber' })
  idCardNumber: string;

  @IsString()
  @ApiProperty({ type: String, description: 'typeBusiness' })
  typeBusiness: string;

  @ApiProperty({ type: String, description: 'Image ID card back' })
  imageBack: string;

  @ApiProperty({ type: String, description: 'Image ID card back' })
  imageFront: string;

  @ApiProperty({ type: String, description: 'imageLicense' })
  imageLicense: string;
}

export class UpdateVerifyDataDto {
  @ApiProperty({ type: String, description: 'logo' })
  logo: string;

  @ApiProperty({ type: String, description: 'fullname' })
  fullname: string;

  @ApiProperty({ type: String, description: 'address' })
  address: string;

  @ApiProperty({ type: String, description: 'phoneNumber' })
  phoneNumber: string;

  @ApiProperty({ type: String, description: 'idLicense' })
  idLicense: string;

  @ApiProperty({ type: String, description: 'idCardNumber' })
  idCardNumber: string;

  @ApiProperty({ type: String, description: 'typeBusiness' })
  typeBusiness: string;

  @ApiProperty({ type: String, description: 'Image ID card back' })
  imageBack: string;

  @ApiProperty({ type: String, description: 'Image ID card back' })
  imageFront: string;

  @ApiProperty({ type: String, description: 'imageLicense' })
  imageLicense: string;
}
