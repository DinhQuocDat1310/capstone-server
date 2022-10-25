import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsNumberString, IsString } from 'class-validator';

export class WrapDTO {
  @ApiProperty({ type: String, description: 'ID wrap' })
  @IsString()
  wrapId: string;

  @ApiProperty({ type: String, description: 'Price wrap' })
  @IsNumberString()
  price: string;

  @ApiProperty({ type: String, description: 'Status of wrap' })
  @IsEnum([Status.ENABLE, Status.DISABLE], {
    message: 'Status action must be following format: [ENABLE, DISABLE]',
  })
  status: Status;
}
