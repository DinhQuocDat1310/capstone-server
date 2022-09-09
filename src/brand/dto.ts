import { IsNumberString, IsOptional, IsString, Matches } from 'class-validator';

export class BrandDTO {
  @IsString()
  @IsOptional()
  ownerLicenseBusiness: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsOptional()
  @Matches(/^0\d{9}/)
  phoneNumber: string;

  @IsString()
  @IsOptional()
  idLicense: string;

  @IsNumberString()
  @IsOptional()
  idCitizen: string;

  @IsString()
  @IsOptional()
  typeBusiness: string;

  @IsOptional()
  logo: string;

  @IsOptional()
  imageCitizenBack: string;

  @IsOptional()
  imageCitizenFront: string;

  @IsOptional()
  imageLicenseBusiness: string;
}

export class FileImageUploadForBrand {
  logo?: Express.Multer.File;
  imageLicenseBusiness?: Express.Multer.File;
  imageCitizenFront?: Express.Multer.File;
  imageCitizenBack?: Express.Multer.File;
}

export class FileImageUploaddedForBrand {
  logo?: string;
  imageLicenseBusiness?: string;
  imageCitizenFront?: string;
  imageCitizenBack?: string;
}
