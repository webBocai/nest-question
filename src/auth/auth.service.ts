import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserBodyDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async login(data: UserBodyDto) {
    console.log('data', data);

    const user = await this.userService.findOne(data.username);
    if (!user) {
      return new UnauthorizedException('用户名或密码错误');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user.toObject();
    return {
      token: await this.jwtService.signAsync(result),
    };
  }
}
