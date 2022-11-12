import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsLatitude, IsLongitude } from 'class-validator';

export class LocationDTO {
  @ApiProperty({ type: String, description: 'id location' })
  id: string;

  @ApiProperty({ type: String, description: 'name location' })
  locationName: string;

  @ApiProperty({ type: String, description: 'price on 1 km' })
  price: string;

  @ApiProperty({ type: String, description: 'Status of wrap' })
  status: Status;
}

export class LocationCoordinate {
  @ApiProperty({ type: Number, description: 'Latitude' })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ type: Number, description: 'Longitude' })
  @IsLongitude()
  longitude: number;
}

export class LocationCoordinateDTO {
  @ApiProperty({ type: LocationCoordinate, description: 'Start Point' })
  pointA: LocationCoordinate;

  @ApiProperty({ type: LocationCoordinate, description: 'End Point' })
  pointB: LocationCoordinate;
}
