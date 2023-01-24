import { ApiProperty } from '@nestjs/swagger';
import { Role, StatusUser } from '@prisma/client';

export class SignInDto {
  @ApiProperty({ type: String, description: 'email or phoneNumber' })
  username: string;
  @ApiProperty({ type: String, description: 'password' })
  password: string;
}

export class RequestUser {
  user: UserSignIn;
}

export class UserSignIn {
  id: string;
  email: string;
  role: Role;
  status: StatusUser;
  address: string;
}
