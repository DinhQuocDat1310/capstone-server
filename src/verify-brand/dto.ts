import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyInfoDto {
  @IsString()
  @ApiProperty({ type: String, description: 'idVerify' })
  idVerify: string;
  @IsString()
  @ApiProperty({ type: String, description: 'detail' })
  detail: string;
}
