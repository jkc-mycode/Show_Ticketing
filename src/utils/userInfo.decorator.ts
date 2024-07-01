import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// eslint-disable-next-line prettier/prettier
export const UserInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ? request.user : null;
  },
);
