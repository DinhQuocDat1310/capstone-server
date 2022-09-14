import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsString,
  IsEmail,
  ValidateIf,
  IsEnum,
  Matches,
} from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @ValidateIf((user) => user.role === 'BRAND')
  @ApiProperty({ type: String, description: 'brandName' })
  brandName?: string;

  @IsEmail()
  @ValidateIf((user) => user.email !== undefined || user.role === 'BRAND')
  @ApiProperty({ type: String, description: 'email' })
  email?: string;

  @IsEnum([Role.BRAND, Role.DRIVER], {
    message: 'Role must be following format: [BRAND, DRIVER]',
  })
  @ApiProperty({ enum: [Role.BRAND, Role.DRIVER], description: 'role' })
  role: Role;

  @ValidateIf(
    (user) => user.phoneNumber !== undefined || user.role === 'DRIVER',
  )
  @IsString()
  @Matches(/^0\d{9}/, {
    message: 'Incorrect phone number format. Please input 10 digits',
  })
  @ApiProperty({ type: String, description: 'phoneNumber' })
  phoneNumber?: string;

  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase, one number and one special case character',
    },
  )
  @ApiProperty({ type: String, description: 'password' })
  password: string;
}

export class UserDTO {
  @ApiProperty({ type: String, description: 'fullname' })
  fullname?: string;

  @ApiProperty({ type: String, description: 'brandName' })
  brandName?: string;

  @ApiProperty({ type: String, description: 'email' })
  email?: string;

  @ApiProperty({ enum: Role, description: 'role' })
  role: Role;

  @ApiProperty({ type: String, description: 'phoneNumber' })
  phoneNumber?: string;

  @ApiProperty({ type: Object, description: 'Brand Info' })
  brand?: object;
  @ApiProperty({ type: Object, description: 'Manager Info' })
  manager?: object;
  @ApiProperty({ type: Object, description: 'Driver Info' })
  driver?: object;
}

export class ChangePasswordDTO {
  @ApiProperty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase, one number and one special case character',
    },
  )
  currentPassword: string;

  @ApiProperty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase, one number and one special case character',
    },
  )
  newPassword: string;
}
