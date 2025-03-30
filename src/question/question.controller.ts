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

/**
 * 问卷控制器
 * 处理问卷相关的HTTP请求
 */
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  /**
   * 获取问卷列表
   * @param req 请求对象
   * @param keywords 搜索关键词
   * @param isPublished 是否已发布
   * @param isStar 是否标星
   * @param isDeleted 是否已删除
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 返回问卷列表和总数
   */
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

  /**
   * 创建新问卷
   * @param body 问卷数据
   * @param req 请求对象
   * @returns 返回创建的问卷
   */
  @Post()
  create(@Body() body: QuestionBodyDto, @Request() req) {
    return this.questionService.create(req.user.username);
  }

  /**
   * 批量删除问卷
   * @param req 请求对象
   * @param ids 问卷ID数组
   * @returns 返回删除结果
   */
  @Delete('delete')
  deleteAll(@Request() req, @Query() ids: string[]) {
    const author = req.user.username;
    const id = Array.isArray(ids['ids[]']) ? ids['ids[]'] : [ids['ids[]']];
    return this.questionService.deleteAll(id, author);
  }

  /**
   * 删除单个问卷
   * @param id 问卷ID
   * @param req 请求对象
   * @returns 返回删除结果
   */
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    const author = req.user.username;
    return this.questionService.delete(id, author);
  }

  /**
   * 获取单个问卷详情
   * @param id 问卷ID
   * @returns 返回问卷详情
   */
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(id);
  }

  /**
   * 恢复已删除的问卷
   * @param ids 问卷ID数组
   * @param req 请求对象
   * @returns 返回恢复结果
   */
  @Patch('recover')
  recover(@Body('ids') ids: string[], @Request() req) {
    const author = req.user.username;
    return this.questionService.recover(ids, author);
  }

  /**
   * 更新问卷
   * @param id 问卷ID
   * @param req 请求对象
   * @param body 更新的问卷数据
   * @returns 返回更新后的问卷
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() body: QuestionBodyDto,
  ) {
    const author = req.user.username;
    return this.questionService.update(id, author, body);
  }

  /**
   * 复制问卷
   * @param id 问卷ID
   * @param req 请求对象
   * @returns 返回复制后的问卷
   */
  @Patch('dupulicate/:id')
  duplicate(@Param('id') id: string, @Request() req) {
    const author = req.user.username;
    return this.questionService.duplicate(id, author);
  }
}
