import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GitlabProject } from '../gitalb/gitlab-dto';
import { GitlabRepository } from '../gitalb/gitlab-repository';
import { Project } from './project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly gitlabRepository: GitlabRepository,
  ) {}

  async findGitlabProject(project: Partial<Project>): Promise<GitlabProject> {
    try {
      return await this.gitlabRepository.getProject(project);
    } catch (err) {
      return undefined;
    }
  }

  async find(project: Partial<Project>): Promise<Project> {
    return await this.projectRepository.findOne({
      where: {
        gitlabUrl: project.gitlabUrl,
        gitlabProjectId: project.gitlabProjectId,
      },
    });
  }

  async register(project: Partial<Project>): Promise<Project> {
    if (await this.find(project)) {
      return Promise.reject(new Error('Project is already exists.'));
    }
    await this.projectRepository.insert({
      ...project,
    });

    return await this.find(project);
  }

  async findAll(): Promise<Project[]> {
    return await this.projectRepository.find();
  }
}
