import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GitlabRepository } from './gitalb/gitlab-repository';
import { IssueDetail } from './issue/issue-detail-entity';
import { Issue } from './issue/issue.entity';
import { IssueModule } from './issue/issue.module';
import { ProjectController } from './project/project.controller';
import { Project } from './project/project.entity';
import { ProjectModule } from './project/project.module';
import { ProjectService } from './project/project.service';
import { Review } from './review/review.entity';
import { ReviewModule } from './review/review.module';
import { ReviewService } from './review/review.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      charset: 'utf8mb4',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'gitlab-review',
      entities: [Project, Review, Issue, IssueDetail],
      synchronize: true,
      logging: false,
    }),
    ProjectModule,
    ReviewModule,
    IssueModule,
  ],
  controllers: [AppController, ProjectController],
  providers: [AppService, ProjectService, ReviewService, GitlabRepository],
})
export class AppModule {}
