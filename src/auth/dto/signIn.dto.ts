import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ type: String, description: 'email' })
  email: string;
  @ApiProperty({ type: String, description: 'phoneNumber' })
  phoneNumber: string;
  @ApiProperty({ type: String, description: 'password' })
  password: string;
}
