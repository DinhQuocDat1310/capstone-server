import { ApiProperty } from '@nestjs/swagger';

export class globalDateDTO {
  @ApiProperty({ type: Date, description: 'Global date' })
  date: Date;
}

export class globalHourDTO {
  @ApiProperty({ type: String, description: 'Global hour' })
  hour: string;
}
