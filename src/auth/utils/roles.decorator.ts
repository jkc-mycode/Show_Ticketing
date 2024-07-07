import { SetMetadata } from '@nestjs/common';
import { AUTH_CONSTANT } from 'src/constants/auth/auth.constant';
import { Role } from 'src/user/types/user-role.type';

export const Roles = (...roles: Role[]) => SetMetadata(AUTH_CONSTANT.UTIL.ROLES, roles);
