import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class WrapDTO {
  @ApiProperty({ type: String, description: 'ID wrap' })
  @IsString()
  wrapId: string;

  @ApiProperty({ type: String, description: 'Price wrap' })
  @IsNumber()
  price: string;

  @ApiProperty({ type: String, description: 'Status of wrap' })
  status: boolean;
}
