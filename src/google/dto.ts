import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleDistanceMatrixDto {
  @ApiProperty({
    description: 'Longitude origins',
  })
  @IsString()
  longitudeOri: string;

  @ApiProperty({
    description: 'Latitude origins',
  })
  @IsString()
  latitudeOri: string;

  @ApiProperty({
    description: 'Longitude destination',
  })
  @IsString()
  longitudeDes: string;

  @ApiProperty({
    description: 'Latitude destination',
  })
  @IsString()
  latitudeDes: string;
}

export class ResponseGoogleMatrix {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: {
    elements: {
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      status: string;
    }[];
  }[];
  status: string;
}
