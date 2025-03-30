import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { QuestionBodyDto } from './dto/question.dto';
import { QuestionService } from './question.service';
import { Public } from 'src/auth/decorators/public.decorators';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}
  @Get('/list')
  async fiList(
    @Request() req,
    @Query('keyword') keywords: string,
    @Query('isPublished') isPublished: boolean,
    @Query('isStar') isStar: boolean,
    @Query('isDeleted') isDeleted: boolean,
    @Query('page')
    page: number,

    @Query('pageSize') pageSize: number,
  ) {
    const list = await this.questionService.fiList(
      keywords,
      page,
      pageSize,
      isPublished,
      isStar,
      isDeleted,
    );
    const total = await this.questionService.fiCount(
      keywords,
      isPublished,
      isStar,
      isDeleted,
      // req.user.username,
    );
    return {
      list: list,
      total: total,
    };
  }
  @Post()
  create(@Body() body: QuestionBodyDto, @Request() req) {
    return this.questionService.create(req.user.username);
  }
  @Delete('delete')
  deleteAll(@Request() req, @Query() ids: string[]) {
    const author = req.user.username;
    const id = Array.isArray(ids['ids[]']) ? ids['ids[]'] : [ids['ids[]']];
    return this.questionService.deleteAll(id, author);
  }
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    const author = req.user.username;

    return this.questionService.delete(id, author);
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(id);
  }
  @Patch('recover')
  recover(@Body('ids') ids: string[], @Request() req) {
    const author = req.user.username;
    return this.questionService.recover(ids, author);
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() body: QuestionBodyDto,
  ) {
    const author = req.user.username;

    return this.questionService.update(id, author, body);
  }

  @Patch('dupulicate/:id')
  duplicate(@Param('id') id: string, @Request() req) {
    const author = req.user.username;
    return this.questionService.duplicate(id, author);
  }
}
