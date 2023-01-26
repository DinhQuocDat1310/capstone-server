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

export class ResponseMapBoxMatrix {
  routes: { duration: number; distance: number }[];
}
