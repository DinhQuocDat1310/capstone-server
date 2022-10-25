import { ApiProperty } from '@nestjs/swagger';

export class LocationDTO {
  @ApiProperty({ type: String, description: 'name location' })
  locationName: string;

  @ApiProperty({ type: String, description: 'Price on 1 km' })
  price: string;
}
