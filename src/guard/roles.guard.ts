import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './decorators';
import { UsersService } from 'src/user/service';
import { RequestUser } from 'src/auth/dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireRoles = this.reflector.get<Role[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requireRoles) {
      return true;
    }
    const request: RequestUser = context.switchToHttp().getRequest();
    const userReq = request.user;
    if (!userReq) {
      return false;
    }
    const user = await this.userService.findUserByEmailOrPhoneNumber(
      userReq.email,
      userReq.phoneNumber,
    );
    if (!user) return false;
    return requireRoles.some((role) => role === user.role);
  }
}
