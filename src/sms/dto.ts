import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class VerifySMSDto {
  @IsNumberString()
  @ApiProperty({ type: String, description: 'otp' })
  otpCode: string;
}
