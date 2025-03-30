import { Controller, Get, Param, Post } from '@nestjs/common';
import { StatService } from './stat.service';

@Controller('stat')
export class StatController {
  constructor(private readonly statService: StatService) {}
  @Get(':id')
  stat(
    @Param('id') id: string,
    @Param('page') page: number,
    @Param('pageSize') pageSize: number,
  ) {
    return this.statService.getQuestionStaListAndCount(id, { page, pageSize });
  }
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
