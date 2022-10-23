import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumberString, IsString, IsUrl } from 'class-validator';

export class DriverVerifyInformationDTO {
  @ApiProperty({
    description: 'Name of Driver',
    default: 'Nguyen Van A',
  })
  @IsString()
  fullname: string;

  @ApiProperty({
    description: `driver's address`,
    default: 'Ho Chi Minh',
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'email',
    default: 'a@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'identity citizen number',
  })
  @IsNumberString()
  idCitizen: string;

  @ApiProperty({
    description: 'id license plate',
  })
  @IsString()
  idCar: string;

  @ApiProperty({
    description: 'Bank account number',
  })
  @IsNumberString()
  bankAccountNumber: string;

  @ApiProperty({
    description: 'Owner account bank',
  })
  @IsString()
  bankAccountOwner: string;

  @ApiProperty({
    description: 'Bank Name',
  })
  @IsString()
  bankName: string;

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
    description: 'URL image of car back',
    default: 'image.com',
  })
  @IsUrl(undefined)
  imageCarBack: string;

  @ApiProperty({
    description: 'URL image of car front',
    default: 'image.com',
  })
  @IsUrl(undefined)
  imageCarFront: string;

  @ApiProperty({
    description: 'URL image of car right',
    default: 'image.com',
  })
  @IsUrl(undefined)
  imageCarRight: string;

  @ApiProperty({
    description: 'URL image of car left',
    default: 'image.com',
  })
  @IsUrl(undefined)
  imageCarLeft: string;
}

export class DriverJoinCampaign {
  @ApiProperty({
    description: 'Id of the campaign',
    default: 'uuid',
  })
  id: string;
}
