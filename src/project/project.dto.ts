import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator';

export class CreateProjectRequest {
  @IsNotEmpty()
  @IsUrl()
  gitlabUrl: string;

  @IsNotEmpty()
  gitlabProjectId: number;

  @IsNotEmpty()
  @MaxLength(32)
  gitlabUserToken: string;
}
