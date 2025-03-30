import { Injectable } from '@nestjs/common';
import { Answer } from './schemas/answer.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { QuestionBodyDto } from 'src/question/dto/question.dto';

@Injectable()
export class AnswerService {
  constructor(@InjectModel(Answer.name) private answerModel) {}
  async create(data: QuestionBodyDto) {
    const answer = new this.answerModel(data);
    return await answer.save();
  }
  async count(id: string) {
    if (!id) return 0;
    return await this.answerModel.countDocuments({ f_id: id });
  }
  async findAll(id: string, opt: { page: number; pageSize: number }) {
    if (!id) return [];
    const list = await this.answerModel
      .find({ f_id: id })
      .skip((opt.page - 1) * opt.pageSize)
      .limit(opt.pageSize)
      .sort({ createdAt: -1 });
    return list;
  }
}
