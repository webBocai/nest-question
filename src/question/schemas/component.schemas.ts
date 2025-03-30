import { Prop, Schema } from '@nestjs/mongoose';
import { nanoid } from 'nanoid';

@Schema()
export class ComponentProps {
  @Prop({ default: () => nanoid() })
  f_id: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: false })
  isLock?: boolean;

  @Prop({ default: false })
  isHide?: boolean;

  @Prop()
  props: any;
}
