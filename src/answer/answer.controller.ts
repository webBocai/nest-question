import { Body, Controller, Post } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { Public } from 'src/auth/decorators/public.decorators';
import { QuestionBodyDto } from 'src/question/dto/question.dto';

@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}
  @Public()
  @Post()
  answer(@Body() data: QuestionBodyDto) {
    return this.answerService.create(data);
  }
}
