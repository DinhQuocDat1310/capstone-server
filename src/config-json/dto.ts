import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class VariableConfig {
  @IsArray()
  @ApiProperty({
    type: Array,
    description: 'Duration',
    default: ['30', '60', '90'],
  })
  duration: string[];

  @IsString()
  @ApiProperty({
    type: String,
    description: 'GapOpenRegisterForm',
    default: '5',
  })
  gapOpenRegisterForm: string;

  @IsString()
  @ApiProperty({ type: String, description: 'GapPaymentDeposit', default: '5' })
  gapPaymentDeposit: string;

  @IsString()
  @ApiProperty({ type: String, description: 'GapWrapping', default: '5' })
  gapWrapping: string;
}
