export class QuestionBodyDto {
  readonly f_id: string;
  readonly awswerList: Array<{
    componentId: string;
    value: string;
  }>;
}
