import { ApiProperty } from '@nestjs/swagger';

export class globalDateDTO {
  @ApiProperty({ type: Date, description: 'Global date' })
  date: string;
}
