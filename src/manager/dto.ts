import { ApiProperty } from '@nestjs/swagger';
import { VerifyAccountStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

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
