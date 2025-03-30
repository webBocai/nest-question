import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorators';

/**
 * 认证守卫
 * 用于验证请求中的JWT token,保护需要认证的路由
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService, // JWT服务,用于验证token
    private reflector: Reflector, // 反射器,用于获取路由元数据
  ) {}

  /**
   * 验证请求是否可以通过
   * @param context 执行上下文
   * @returns 返回true表示通过验证,false表示拒绝请求
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查路由是否标记为公开访问
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 如果是公开路由,直接放行
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('请登录！！！');
    }
    try {
      // 验证token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      // 将解析出的用户信息添加到请求对象中
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('登录失效，请重新登录！');
    }
    return true;
  }

  /**
   * 从请求头中提取token
   * @param request Express请求对象
   * @returns token字符串,如果没有则返回undefined
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const token = request.headers.authtoken;
    return token as string;
  }
}
