import { ApiProperty } from '@nestjs/swagger';
import { StatusVerifyAccount, StatusVerifyCampaign } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class ManagerVerifyDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'ID of request verify account' })
  verifyId: string;

  @IsEnum(
    [
      StatusVerifyAccount.BANNED,
      StatusVerifyAccount.UPDATE,
      StatusVerifyAccount.ACCEPT,
    ],
    {
      message: 'Action must be following format: [BANNED, UPDATE, ACCEPT]',
    },
  )
  @ApiProperty({
    enum: [
      StatusVerifyAccount.BANNED,
      StatusVerifyAccount.UPDATE,
      StatusVerifyAccount.ACCEPT,
    ],
    example: [
      StatusVerifyAccount.BANNED,
      StatusVerifyAccount.UPDATE,
      StatusVerifyAccount.ACCEPT,
    ],
    description: 'action',
  })
  action: StatusVerifyAccount;

  @IsString()
  @ApiProperty()
  @ValidateIf(
    (verify) => verify.action === 'UPDATE' || verify.action === 'BANNED',
  )
  detail: string;
}

export class ManagerVerifyCampaignDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'ID of request verify account' })
  verifyId: string;

  @IsEnum([StatusVerifyCampaign.BANNED, StatusVerifyCampaign.UPDATE], {
    message: 'Action must be following format: [BANNED, UPDATE]',
  })
  @ApiProperty({
    enum: [StatusVerifyCampaign.BANNED, StatusVerifyCampaign.UPDATE],
    example: [StatusVerifyCampaign.BANNED, StatusVerifyCampaign.UPDATE],
    description: 'action',
  })
  action: StatusVerifyCampaign;

  @IsString()
  @ApiProperty()
  @ValidateIf(
    (verify) => verify.action === 'UPDATE' || verify.action === 'BANNED',
  )
  detail: string;
}

export class ManagerDTO {
  @IsString()
  @ApiProperty({ type: String, description: 'Fullname' })
  fullname: string;

  @IsEmail()
  @ApiProperty({ type: String, description: 'Email' })
  email: string;

  @IsString()
  @Matches(/^0\d{9}$|\+84\d{9}$/, {
    message: 'Incorrect phone number format. Please input 10 digits',
  })
  @ApiProperty({ type: String, description: 'phoneNumber' })
  phoneNumber: string;

  @ApiProperty({ type: String, description: 'Password' })
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase, one number and one special case character',
    },
  )
  password: string;
}

export class AssignDto {
  @IsString()
  @ApiProperty({ type: String, description: 'Verify ID' })
  verifyId: string;

  @IsString()
  @ApiProperty({ type: String, description: 'Manager ID' })
  managerId: string;
}
