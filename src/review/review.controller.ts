import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('projects/:projectId/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  async list(@Param('projectId') projectId: number) {
    await this.validateProjectId(projectId);

    return await this.reviewService.findAll(projectId);
  }

  @Post('collect')
  @HttpCode(HttpStatus.ACCEPTED)
  async collect(@Param('projectId') projectId: number) {
    await this.validateProjectId(projectId);
    this.reviewService.collect(projectId);
  }

  private async validateProjectId(projectId: number) {
    const project = await this.reviewService.findProject(projectId);
    if (!project) {
      throw new NotFoundException(`project not found.`);
    }
  }
}
