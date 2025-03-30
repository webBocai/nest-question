import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

import { Request, Response } from 'express';

/**
 * HTTP异常过滤器
 * 用于捕获和处理HTTP异常
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * 捕获并处理HTTP异常
   * @param exception - HTTP异常对象
   * @param host - 参数主机对象
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    // 获取HTTP上下文
    const ctx = host.switchToHttp();
    // 获取响应对象
    const response = ctx.getResponse<Response>();
    // 获取请求对象
    const request = ctx.getRequest<Request>();
    // 获取HTTP状态码
    const status = exception.getStatus();
    // 获取错误信息,如果没有则默认为'服务器错误'
    const message = exception.message ? exception.message : '服务器错误';

    // 返回统一格式的错误响应
    response.status(status).json({
      error: -1, // 错误码
      message, // 错误信息
      timestamp: new Date().toISOString(), // 时间戳
      path: request.url, // 请求路径
    });
  }
}
