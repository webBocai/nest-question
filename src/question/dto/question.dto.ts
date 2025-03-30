export class QuestionBodyDto {
  readonly pageSetting: {
    id: string;
    title: string;
    desc: string;
    author: string;
    js?: string;
    css?: string;
    isPublished?: boolean;
  };
  readonly componentList: Array<{
    f_id: string;
    type: string;
    title: string;
    isLock?: boolean;
    isHide?: boolean;
    props: any;
  }>;
}
