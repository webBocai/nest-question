import { Controller, Get, Param, Post } from '@nestjs/common';
import { StatService } from './stat.service';

/**
 * 统计控制器
 * 处理问卷统计相关的HTTP请求
 */
@Controller('stat')
export class StatController {
  constructor(private readonly statService: StatService) {}

  /**
   * 获取问卷统计列表
   * @param id 问卷ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 返回问卷统计列表和总数
   */
  @Get(':id')
  stat(
    @Param('id') id: string,
    @Param('page') page: number,
    @Param('pageSize') pageSize: number,
  ) {
    return this.statService.getQuestionStaListAndCount(id, { page, pageSize });
  }

  /**
   * 获取问卷组件的统计数据
   * @param id 问卷ID
   * @param componentId 组件ID
   * @returns 返回组件的统计数据列表
   */
  @Post('chart/:id/:componentId')
  async chart(
    @Param('id') id: string,
    @Param('componentId') componentId: string,
  ) {
    const list = await this.statService.getComponentStat(id, componentId);
    return {
      list,
    };
  }
}
