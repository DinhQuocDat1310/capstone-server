import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class LocationDTO {
  @ApiProperty({ type: String, description: 'id location' })
  id: string;

  @ApiProperty({ type: String, description: 'name location' })
  locationName: string;

  @ApiProperty({ type: String, description: 'price on 1 km' })
  price: string;

  @ApiProperty({ type: String, description: 'Status of wrap' })
  @IsEnum([Status.ENABLE, Status.DISABLE], {
    message: 'Status action must be following format: [ENABLE, DISABLE]',
  })
  status: Status;
}
