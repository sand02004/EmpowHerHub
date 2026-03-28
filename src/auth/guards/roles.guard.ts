import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../common/prisma-types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true; // No roles defined, meaning route is open for any authenticated user
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) throw new ForbiddenException('User context is missing');
    
    const hasRole = requiredRoles.some((role) => user.role?.toUpperCase() === role.toUpperCase());
    if (!hasRole) throw new ForbiddenException('You do not have the required role to access this resource');
    
    return true;
  }
}
