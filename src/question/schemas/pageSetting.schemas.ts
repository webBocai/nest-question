import { Prop, Schema } from '@nestjs/mongoose';
import { nanoid } from 'nanoid';

@Schema()
export class PageSettingProps {
  @Prop({ default: () => nanoid() })
  id: string;

  @Prop({ required: true, default: '' })
  title: string;

  @Prop({ required: true, default: 'Description' })
  desc: string;

  @Prop({ required: true, default: '' })
  author: string;

  @Prop({ default: '' })
  js?: string;

  @Prop({ default: '' })
  css?: string;

  @Prop({ default: false })
  isPublished?: boolean;
  @Prop({ default: false })
  isStar?: boolean;
  @Prop({ default: false })
  isDeleted?: boolean;
}
