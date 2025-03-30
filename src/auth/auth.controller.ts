import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserBodyDto } from 'src/user/dto/user.dto';
import { Public } from './decorators/public.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('login')
  async login(@Body() data: UserBodyDto) {
    return await this.authService.login(data);
  }
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
