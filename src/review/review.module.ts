import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitlabRepository } from '../gitalb/gitlab-repository';
import { IssueDetail } from '../issue/issue-detail-entity';
import { Issue } from '../issue/issue.entity';
import { Project } from '../project/project.entity';
import { ReviewController } from './review.controller';
import { Review } from './review.entity';
import { ReviewService } from './review.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Review, Issue, IssueDetail])],
  exports: [TypeOrmModule],
  controllers: [ReviewController],
  providers: [ReviewService, GitlabRepository],
})
export class ReviewModule {}
