import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserStatus } from '@prisma/client';
import { STATUS_KEY } from './decorators';
import { RequestUser } from 'src/auth/dto';

@Injectable()
export class StatusGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireStatus = this.reflector.get<UserStatus[]>(
      STATUS_KEY,
      context.getHandler(),
    );
    if (!requireStatus) {
      return true;
    }
    const request: RequestUser = context.switchToHttp().getRequest();
    const isValid = requireStatus.some(
      (status) => status === request.user.status,
    );
    if (!isValid)
      throw new ForbiddenException(
        `Your account is don't have permission to access this resource`,
      );
    return isValid;
  }
}
