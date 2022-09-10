import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString, IsUrl, Matches } from 'class-validator';

export class BrandVerifyInformationDTO {
  @ApiProperty()
  @IsString()
  ownerLicenseBusiness: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @Matches(/^0\d{9}/, {
    message: 'Incorrect phone number format. Please input 10 digits',
  })
  phoneNumber: string;

  @ApiProperty()
  @IsNumberString()
  idLicense: string;

  @ApiProperty()
  @IsNumberString()
  idCitizen: string;

  @ApiProperty()
  @IsString()
  typeBusiness: string;

  @ApiProperty()
  @IsUrl(undefined)
  logo: string;

  @ApiProperty()
  @IsUrl(undefined)
  imageCitizenBack: string;

  @ApiProperty()
  @IsUrl(undefined)
  imageCitizenFront: string;

  @ApiProperty()
  @IsUrl(undefined)
  imageLicenseBusiness: string;
}

export class ChangePasswordDTO {
  @ApiProperty()
  @Matches(/^0\d{9}/, {
    message: 'Incorrect phone number format. Please input 10 digits',
  })
  currentPassword: string;

  @ApiProperty()
  @Matches(/^0\d{9}/, {
    message: 'Incorrect phone number format. Please input 10 digits',
  })
  newPassword: string;
}
