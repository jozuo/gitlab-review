import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitlabRepository } from '../gitalb/gitlab-repository';
import { Project } from '../project/project.entity';
import { Review } from '../review/review.entity';
import { ReviewService } from '../review/review.service';
import { IssueDetail } from './issue-detail-entity';
import { IssueController } from './issue.controller';
import { Issue } from './issue.entity';
import { IssueService } from './issue.service';

@Module({
  imports: [TypeOrmModule.forFeature([Issue, IssueDetail, Review, Project])],
  exports: [TypeOrmModule],
  controllers: [IssueController],
  providers: [IssueService, ReviewService, GitlabRepository],
})
export class IssueModule {}
