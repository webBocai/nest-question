import { Body, Controller, Post, Redirect } from '@nestjs/common';
import { UserService } from './user.service';
import { UserBodyDto } from './dto/user.dto';
import { Public } from 'src/auth/decorators/public.decorators';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}
  @Public()
  @Post()
  async register(@Body() data: UserBodyDto) {
    return await this.UserService.register(data);
  }
  @Post('userInfo')
  @Redirect('/api/auth/profile', 302) // get请求 301 永久重定向 302 临时重定向
  info() {
    return;
  }
  @Public()
  @Post('login')
  @Redirect('/api/auth/login', 307) // post请求 308 永久重定向 307 临时重定向
  login() {
    return;
  }
}
