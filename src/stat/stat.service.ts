import { Injectable } from '@nestjs/common';
import { AnswerService } from 'src/answer/answer.service';
import { QuestionService } from 'src/question/question.service';

@Injectable()
export class StatService {
  constructor(
    private readonly answerService: AnswerService,
    private readonly questionService: QuestionService,
  ) {}
  private _getOptText(value: string, options: any[]) {
    let text = '';
    console.log('options', options);

    console.log('value', value);

    options.forEach((item) => {
      if (item.value === value) {
        text = item.label;
      }
    });
    console.log('text', text);

    return text || '--';
  }
  private _genAnswersInfo(question, awswerList = []) {
    const res = {};
    const { componentList = [] } = question;

    awswerList.forEach((item) => {
      const { componentId, value = [] } = item as any;
      const component = componentList.find((c) => c.f_id === componentId);
      if (!component) return;
      const { type = '', props = {} } = component;

      if (['questionRedio', 'questionCheckbox'].includes(type)) {
        res[componentId as string] = Array.isArray(value)
          ? value
          : value
              .split(',')
              .map((v) => this._getOptText(v, props.options))
              .toString();
      } else {
        res[componentId as string] = Array.isArray(value)
          ? value.join(',')
          : value.toString();
      }
    });

    return res;
  }
  async getQuestionStaListAndCount(
    id: string,
    opt: { page: number; pageSize: number },
  ) {
    const noData = { list: [], total: 0 };
    if (!id) return noData;
    const q = await this.questionService.findOne(id);
    if (!q) return noData;
    const total = await this.answerService.count(id);
    if (total === 0) return noData;
    const answerlist = await this.answerService.findAll(id, opt);

    const answersInfoList = answerlist.map((item) => {
      return {
        _id: item._id,
        ...this._genAnswersInfo(q, item.awswerList),
      };
    });
    return { list: answersInfoList, total };
  }
  async getComponentStat(id: string, componentId: string) {
    if (!id || !componentId) return [];
    const q = await this.questionService.findOne(id);
    if (!q) return [];
    const { componentList = [] } = q;

    const comp = componentList.find((c) => c.f_id === componentId);
    if (!comp) return [];
    const { type, props = {} } = comp;

    if (type !== 'questionRedio' && type !== 'questionCheckbox') return [];

    const total = await this.answerService.count(id);
    if (total === 0) return [];

    const list = await this.answerService.findAll(id, {
      page: 1,
      pageSize: total,
    });
    const countInfo = {};
    const length = list.length;
    for (let i = 0; i < length; i++) {
      const item = list[i];
      const { awswerList } = item;

      awswerList.forEach((answer) => {
        const value = answer.value.split(',');
        if (answer.componentId !== componentId) return;
        value.forEach((v) => {
          if (!countInfo[v]) countInfo[v] = 0;
          countInfo[v] += 1;
        });
      });
    }

    const countList: any[] = [];
    for (const key in countInfo) {
      let text = '';
      if (['questionRedio', 'questionCheckbox'].includes(type)) {
        text = this._getOptText(key, props.options);
      }

      countList.push({
        name: text,
        count: countInfo[key],
      });
    }
    return countList;
  }
}
