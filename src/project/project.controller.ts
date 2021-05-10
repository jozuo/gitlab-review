import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { CreateProjectRequest } from './project.dto';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() request: CreateProjectRequest) {
    const gitlabProject = await this.projectService.findGitlabProject(request);
    if (!gitlabProject) {
      throw new BadRequestException('some parameters are incorrect.');
    }

    const project = await this.projectService.find(request);
    if (project) {
      throw new ConflictException(`project is already exists.`);
    }

    try {
      const result = await this.projectService.register({
        ...request,
        gitlabProjectName: gitlabProject.name,
      });
      result.gitlabUserToken = undefined;
      return result;
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Internal server error.');
    }
  }

  @Get()
  async list() {
    const projects = await this.projectService.findAll();
    projects.forEach(project => (project.gitlabUserToken = undefined));
    return projects;
  }
}
