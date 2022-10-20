import { ApiProperty } from '@nestjs/swagger';
import { VerifyAccountStatus } from '@prisma/client';
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

  @IsEnum([VerifyAccountStatus.BANNED, VerifyAccountStatus.UPDATE], {
    message: 'Action must be following format: [BANNED, UPDATE]',
  })
  @ApiProperty({
    enum: [VerifyAccountStatus.BANNED, VerifyAccountStatus.UPDATE],
    example: [VerifyAccountStatus.BANNED, VerifyAccountStatus.UPDATE],
    description: 'action',
  })
  action: VerifyAccountStatus;

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
