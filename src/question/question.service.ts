/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from './schemas/question.schemas';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
@Injectable()
export class QuestionService {
  constructor(@InjectModel(Question.name) private questionModel) {}
  async commonCallback(id: string) {
    const data = await this.questionModel.find({
      _id: id,
    });

    if (data.length === 0) {
      throw new UnauthorizedException('问卷不存在');
    }
    return data;
  }
  async findOne(id: string) {
    const res = await this.questionModel.findById(id);
    return res;
  }
  async create(username: string) {
    const question = new this.questionModel({
      pageSetting: {
        title: `新建问卷${new Date().getTime()}`,
        author: username,
      },
    });
    return await question.save();
  }
  async delete(id: string, author: string) {
    await this.commonCallback(id);
    const res = await this.questionModel.findOneAndUpdate(
      {
        _id: id,
        'pageSetting.author': author,
      },
      {
        'pageSetting.isDeleted': true,
      },
    );
    if (!res) {
      throw new UnauthorizedException('只能删除自己的问卷');
    }

    return res;
  }
  async update(id: string, author: string, body) {
    body.pageSetting = { ...body };
    const data = await this.commonCallback(id);

    const _doc = data[0].pageSetting._doc;
    const pageSetting = {};
    Object.keys(_doc).forEach((key) => {
      pageSetting[key] =
        body.pageSetting[key] === undefined ? _doc[key] : body.pageSetting[key];
    });
    let componentList = data[0].componentList;
    if (body.componentList) {
      componentList = body.componentList;
    }

    body.pageSetting.author = author;

    const res = await this.questionModel.findOneAndUpdate(
      { _id: id, 'pageSetting.author': author },
      {
        pageSetting,
        componentList,
      },
    );

    if (!res) {
      throw new UnauthorizedException('只能修改自己的问卷');
    }

    return res;
  }
  async fiList(
    keywords = '',
    page = 1,
    pageSize = 10,
    isPublished,
    isStar,
    isDeleted = false,
  ) {
    //   模糊搜索

    const query = {};
    if (isPublished !== undefined)
      query['pageSetting.isPublished'] = isPublished;
    if (isStar !== undefined) query['pageSetting.isStar'] = isStar;
    if (isDeleted !== undefined) query['pageSetting.isDeleted'] = isDeleted;

    if (keywords) {
      const reg = new RegExp(keywords, 'i');
      query['pageSetting.title'] = reg;
    }
    const res = await this.questionModel
      .find(query)
      .sort({ _id: -1 })
      // 从多少数量开始
      .skip((page - 1) * pageSize)
      // 限制返回的数量
      .limit(pageSize);
    const data: any[] = [];

    res.forEach((item) =>
      data.push({
        ...item.pageSetting._doc,
        componentList: item.componentList,
        _id: item._id,
      }),
    );
    return data;
  }
  async fiCount(
    keywords = '',
    isPublished,
    isStar,
    isDeleted = false,
    // author,
  ) {
    const query = {};
    if (isPublished !== undefined)
      query['pageSetting.isPublished'] = isPublished;
    if (isStar !== undefined) query['pageSetting.isStar'] = isStar;
    if (isDeleted !== undefined) query['pageSetting.isDeleted'] = isDeleted;
    if (keywords) {
      const reg = new RegExp(keywords, 'i');
      query['pageSetting.title'] = reg;
    }
    return await this.questionModel.countDocuments(query);
  }
  async deleteAll(ids: string[], author) {
    const res = await this.questionModel.deleteMany({
      _id: { $in: ids },
      'pageSetting.author': author,
    });
    if (!res) {
      throw new UnauthorizedException('只能删除自己的问卷');
    }
    return res;
  }
  async recover(ids: string[], author: string) {
    const res = await this.questionModel.updateMany(
      { _id: { $in: ids } },
      {
        'pageSetting.isDeleted': false,
        'pageSetting.author': author,
      },
    );
    return res;
  }
  async duplicate(id: string, author: string) {
    await this.commonCallback(id);
    const res = await this.questionModel.findById(id);
    console.log('res', res);

    const newQuestion = new this.questionModel({
      _id: new mongoose.Types.ObjectId(),
      pageSetting: {
        ...res.pageSetting,
        title: `${res.pageSetting.title} - 复制`,
        author,
        _id: new mongoose.Types.ObjectId(),
        id: nanoid(),
        isPublished: true,
        isStar: false,
        isDeleted: false,
      },
      componentList: res.componentList.map((item) => ({
        ...item,
        f_id: nanoid(),
      })),
    });
    return await newQuestion.save();
  }
}
