import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import { UserController } from './controller';
import { UsersService } from './service';

@Module({
  controllers: [UserController],
  providers: [UsersService, PrismaService],
})
export class UserModule {}
