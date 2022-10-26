import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelContractDTO {
  @ApiProperty({ type: String, description: 'Contract ID' })
  @IsString()
  contractId: string;

  @ApiProperty({ type: String, description: 'Message detail cancel contract' })
  @IsString()
  message: string;
}
