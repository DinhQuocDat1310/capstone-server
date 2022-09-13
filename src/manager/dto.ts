import { ApiProperty } from '@nestjs/swagger';
import { VerifyAccountStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class ManagerVerifyDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  verifyId: string;

  @IsEnum(
    [
      VerifyAccountStatus.ACCEPT,
      VerifyAccountStatus.BANNED,
      VerifyAccountStatus.UPDATE,
    ],
    {
      message:
        'Action must be following format: [ACCEPT, BANNED, REQUEST_TO_CHANGE]',
    },
  )
  @ApiProperty({
    enum: [
      VerifyAccountStatus.ACCEPT,
      VerifyAccountStatus.BANNED,
      VerifyAccountStatus.UPDATE,
    ],
    example: [
      VerifyAccountStatus.ACCEPT,
      VerifyAccountStatus.BANNED,
      VerifyAccountStatus.UPDATE,
    ],
    description: 'action',
  })
  action?: VerifyAccountStatus;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @ValidateIf(
    (verify) => verify.acction === 'UPDATE' || verify.action === 'BANNED',
  )
  detail: string;
}
