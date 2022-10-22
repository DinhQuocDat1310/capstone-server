import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FAQDto {
  @IsString()
  @ApiProperty({ type: String, description: 'Question' })
  question: string;

  @IsString()
  @ApiProperty({ type: String, description: 'Answer' })
  answer: string;
}
