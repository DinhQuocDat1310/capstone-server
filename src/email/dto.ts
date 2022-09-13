import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class VerifyDto {
  @IsNumberString()
  @ApiProperty({ type: String, description: 'codeNumber' })
  codeInput: string;
}
