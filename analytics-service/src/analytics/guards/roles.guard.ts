import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Якщо ролі не визначені, дозволяємо доступ
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException('User roles not found');
    }

    // Якщо у користувача є роль 'admin', дозволяємо доступ до всіх ресурсів
    if (user.roles.includes('admin')) {
      return true;
    }

    // Перевіряємо, чи має користувач хоча б одну з необхідних ролей
    const hasRequiredRole = requiredRoles.some(role => user.roles.includes(role));

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `User with roles [${user.roles.join(', ')}] does not have required roles [${requiredRoles.join(
          ', ',
        )}]`,
      );
    }

    return true;
  }
}
