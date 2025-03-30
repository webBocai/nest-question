/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from './schemas/question.schemas';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

/**
 * 问卷服务类
 * 提供问卷的创建、查询、更新、删除等功能
 */
@Injectable()
export class QuestionService {
  /**
   * 构造函数
   * @param questionModel 问卷模型，通过依赖注入获取
   */
  constructor(@InjectModel(Question.name) private questionModel) {}

  /**
   * 通用回调函数，用于验证问卷是否存在
   * @param id 问卷ID
   * @returns 返回问卷数据
   * @throws UnauthorizedException 当问卷不存在时抛出异常
   */
  async commonCallback(id: string) {
    const data = await this.questionModel.find({
      _id: id,
    });

    if (data.length === 0) {
      throw new UnauthorizedException('问卷不存在');
    }
    return data;
  }

  /**
   * 根据ID查找单个问卷
   * @param id 问卷ID
   * @returns 返回查找到的问卷
   */
  async findOne(id: string) {
    const res = await this.questionModel.findById(id);
    return res;
  }

  /**
   * 创建新问卷
   * @param username 创建者用户名
   * @returns 返回创建的问卷
   */
  async create(username: string) {
    const question = new this.questionModel({
      pageSetting: {
        title: `新建问卷${new Date().getTime()}`,
        author: username,
      },
    });
    return await question.save();
  }

  /**
   * 删除问卷（软删除）
   * @param id 问卷ID
   * @param author 作者用户名
   * @returns 返回更新后的问卷
   * @throws UnauthorizedException 当用户不是问卷作者时抛出异常
   */
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

  /**
   * 更新问卷信息
   * @param id 问卷ID
   * @param author 作者用户名
   * @param body 更新的内容
   * @returns 返回更新后的问卷
   * @throws UnauthorizedException 当用户不是问卷作者时抛出异常
   */
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

  /**
   * 获取问卷列表
   * @param keywords 搜索关键词
   * @param page 页码
   * @param pageSize 每页数量
   * @param isPublished 是否已发布
   * @param isStar 是否标星
   * @param isDeleted 是否已删除
   * @returns 返回问卷列表数据
   */
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

  /**
   * 获取问卷总数
   * @param keywords 搜索关键词
   * @param isPublished 是否已发布
   * @param isStar 是否标星
   * @param isDeleted 是否已删除
   * @returns 返回符合条件的问卷总数
   */
  async fiCount(keywords = '', isPublished, isStar, isDeleted = false) {
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

  /**
   * 批量删除问卷
   * @param ids 问卷ID数组
   * @param author 作者用户名
   * @returns 返回删除结果
   * @throws UnauthorizedException 当用户不是问卷作者时抛出异常
   */
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

  /**
   * 恢复已删除的问卷
   * @param ids 问卷ID数组
   * @param author 作者用户名
   * @returns 返回恢复结果
   */
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

  /**
   * 复制问卷
   * @param id 原问卷ID
   * @param author 作者用户名
   * @returns 返回新创建的问卷
   */
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
