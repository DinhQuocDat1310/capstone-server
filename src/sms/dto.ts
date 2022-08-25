import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

export class VerifySMSDto {
  @IsString()
  @ApiProperty({ type: String, description: 'otp' })
  otpCode: string;
  @IsString()
  @ApiProperty({ type: String, description: 'phoneNumber' })
  @Matches(/\+(84[3|5|7|8|9])+([0-9]{8})\b/, {
    message: 'Phone number format: +84xxxxxxxxx',
  })
  @MaxLength(14)
  phoneNumber: string;
}
