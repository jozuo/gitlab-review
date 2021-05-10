import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../project/project.entity';
import { Review } from '../review/review.entity';
import { Issue } from './issue.entity';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
  ) {}

  async findProject(projectId: number): Promise<Project> {
    return await this.projectRepository.findOne({ where: { id: projectId } });
  }

  async find(review: Review): Promise<Issue[]> {
    return await this.issueRepository.find({
      where: { review: review },
      relations: ['details'],
    });
  }
}
