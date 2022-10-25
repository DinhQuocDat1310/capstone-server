import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PolicyDto {
  @IsString()
  @ApiProperty({ type: String, description: 'Question' })
  question: string;

  @IsString()
  @ApiProperty({ type: String, description: 'Answer' })
  answer: string;
}
