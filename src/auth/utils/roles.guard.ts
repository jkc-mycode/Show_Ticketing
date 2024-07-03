// 가드(Guard)는 roles.decorator를 기반으로 인가를 할지 결정함
// 즉, roles.decorator에서 알려주는 역할이 통과될 수 있는지 검사함

import { Role } from 'src/user/types/userRole.type';

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// AuthGuard('jwt') jwt 인증이 된 상태에서 역할을 확인하기 위해서 extends를 함
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
  // eslint-disable-next-line prettier/prettier
  constructor(private reflector: Reflector) {
    super();
  }

  // 가능할 경우에 동작하는 것
  async canActivate(context: ExecutionContext) {
    const authenticated = await super.canActivate(context);
    if (!authenticated) {
      return false;
    }

    // @Roles(Role.Admin) -> 'roles'에 [Role.Admin] 배열이 담겨 있음
    // 즉, requiredRoles에 [Role.Admin] 배열이 들어감
    // reflector를 통해서 메타데이터를 탐색 후 'roles' 키의 값을 가져옴
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // 사용자의 role이 메타데이터 'roles' 배열인 requiredRoles에 포함되는지 확인
    // 포함되어 있으면 true 반환
    return requiredRoles.some((role) => user.role === role);
  }
}
