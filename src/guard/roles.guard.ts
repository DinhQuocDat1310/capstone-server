import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from 'src/decorator/roles.decorator';
import { UsersService } from 'src/user/service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requireRoles) {
      return true;
    }
    const user = context.switchToHttp().getRequest();
    const checkRoleUser = await this.userService.findUserByCredentials(
      user.body.email,
      user.body.phoneNumber,
    );
    console.log(checkRoleUser);

    if (checkRoleUser) {
      return requireRoles.some((role) => checkRoleUser.role === role);
    }
    return requireRoles.some((role) => user.body.role === role);
  }
}
