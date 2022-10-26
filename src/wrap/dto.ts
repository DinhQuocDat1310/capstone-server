import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsNumberString, IsString } from 'class-validator';

export class WrapDTO {
  @ApiProperty({ type: String, description: 'ID wrap' })
  @IsString()
  wrapId: string;

  @ApiProperty({ type: String, description: 'Price wrap' })
  @IsNumberString()
  price: string;

  @ApiProperty({ type: String, description: 'Status of wrap' })
  status: Status;
}
