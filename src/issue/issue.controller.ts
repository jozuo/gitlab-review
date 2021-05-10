import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ReviewService } from '../review/review.service';
import { ListIssuesQuery } from './issue-dto';
import { IssueService } from './issue.service';

@Controller('projects/:projectId/issues')
export class IssueController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly issueService: IssueService,
  ) {}

  @Get()
  async list(
    @Param('projectId') projectId: number,
    @Query() query: ListIssuesQuery,
  ) {
    await this.validateProjectId(projectId);

    const review = await this.reviewService.find(projectId, query.reviewIid);
    if (!review) {
      throw new NotFoundException(`review is not found.`);
    }

    return await this.issueService.find(review);
  }

  private async validateProjectId(projectId: number) {
    const project = await this.reviewService.findProject(projectId);
    if (!project) {
      throw new NotFoundException(`project not found.`);
    }
  }
}
