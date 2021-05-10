import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitlabRepository } from '../gitalb/gitlab-repository';
import { ProjectController } from './project.controller';
import { Project } from './project.entity';
import { ProjectService } from './project.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  exports: [TypeOrmModule],
  providers: [ProjectService, GitlabRepository],
  controllers: [ProjectController],
})
export class ProjectModule {}
