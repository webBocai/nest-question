import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PageSettingProps } from './pageSetting.schemas';
import { ComponentProps } from './component.schemas';
import { nanoid } from 'nanoid';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({
  timestamps: true,
})
export class Question {
  @Prop()
  pageSetting: PageSettingProps;

  @Prop({
    default: () => [
      {
        f_id: nanoid(),
        type: 'questionInfo',
        title: '标题',
        isLock: false,
        isHide: false,
        props: {
          title: '标题',
          align: 'center',
          isBold: true,
          showTitle: false,
          text: '内容',
        },
      },
    ],
  })
  componentList: ComponentProps[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
