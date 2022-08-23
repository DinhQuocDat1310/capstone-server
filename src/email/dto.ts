import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class VerifyDto {
  @IsNumber()
  @ApiProperty({ type: Number, description: 'codeNumber' })
  codeInput: number;
  @IsString()
  @ApiProperty({ type: String, description: 'email' })
  email: string;
}
