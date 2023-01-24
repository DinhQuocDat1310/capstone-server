import { ApiProperty } from '@nestjs/swagger';

export class CheckpointDTO {
  @ApiProperty({
    description: 'Name of address checkpoint',
  })
  addressName: string;

  @ApiProperty({
    description: 'Longitude',
  })
  longitude: string;

  @ApiProperty({
    description: 'Latitude',
  })
  latitude: string;

  @ApiProperty({
    description: 'ReporterId',
  })
  reporterId: string;
}

export class RouteDTO {
  @ApiProperty({
    description: 'Name Route',
  })
  name: string;

  @ApiProperty({
    description: 'Price',
  })
  price: string;

  @ApiProperty({
    description: 'Total Kilometer',
  })
  totalKilometer: string;

  @ApiProperty({
    description: 'CheckPoints',
  })
  checkpoints: { id: string }[];
}
