import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AnswerDocument = HydratedDocument<Answer>;

@Schema({
  timestamps: true,
})
export class Answer {
  @Prop({ required: true })
  f_id: string;
  @Prop({ required: true })
  awswerList: Array<{
    componentId: string;
    value: string;
  }>;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
