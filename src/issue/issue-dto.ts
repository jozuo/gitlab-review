import { IsNotEmpty } from 'class-validator';

export class ListIssuesQuery {
  @IsNotEmpty()
  reviewIid: number;
}
