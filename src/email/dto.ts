import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class VerifyDto {
  @IsNumber()
  @ApiProperty({ type: Number, description: 'codeNumber' })
  codeInput: number;
}
