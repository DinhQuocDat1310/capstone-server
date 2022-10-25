import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString } from 'class-validator';

export class WrapDTO {
  @ApiProperty({ type: String, description: 'ID wrap' })
  @IsString()
  wrapId: string;

  @ApiProperty({ type: String, description: 'Price wrap' })
  @IsNumberString()
  price: string;
}
