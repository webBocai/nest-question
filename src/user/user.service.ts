import { Injectable } from '@nestjs/common';
import { User } from './schemas/user.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { UserBodyDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private UserModel) {}
  async register(data: UserBodyDto) {
    const user = new this.UserModel(data);
    return await user.save();
  }
  async findOne(username: string) {
    return await this.UserModel.findOne({ username });
  }
}
