import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { GitlabRepository } from '../gitalb/gitlab-repository';
import { Issue } from '../issue/issue.entity';
import { Project } from '../project/project.entity';
import { Review } from './review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly gitlabRepository: GitlabRepository,
  ) {}

  async findProject(projectId: number): Promise<Project> {
    return await this.projectRepository.findOne({ where: { id: projectId } });
  }

  async find(projectId: number, reviewIid: number): Promise<Review> {
    return await this.reviewRepository.findOne({
      where: { projectId: projectId, iid: reviewIid },
    });
  }

  async findAll(projectId: number): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { projectId: projectId },
    });
  }

  async collect(projectId: number): Promise<void> {
    try {
      const begin = await this.resolveBegin(projectId);
      const project = await this.findProject(projectId);
      const mergeRequests = await this.gitlabRepository.getMergeRequests(
        project,
        begin,
      );

      const reviews = mergeRequests.map(mergeRequest => {
        return Review.fromMergeRequest(projectId, mergeRequest);
      });

      for (const review of reviews) {
        const issues = await this.getIssues(project, review);
        if (issues.length === 0) {
          continue;
        }
        console.log(`register review. id=${review.iid}`);
        await getManager().transaction(async entityManager => {
          await entityManager
            .createQueryBuilder()
            .delete()
            .from(Issue)
            .where('review_id = :reviewId', { reviewId: review.id })
            .execute();

          await entityManager.save(review);
          for (const issue of issues) {
            issue.review = review;
            await entityManager.save(issue);
            for (const detail of issue.details) {
              detail.issue = issue;
              await entityManager.save(detail);
            }
          }
        });
      }
      console.info(`collect review finished.`);
    } catch (err) {
      console.error(err);
    }
  }

  private async getIssues(project: Project, review: Review): Promise<Issue[]> {
    const discussions = await this.gitlabRepository.getDiscussions(
      project,
      review.iid,
    );
    return discussions
      .filter(discussion => {
        return (
          discussion.notes.length !== 1 ||
          discussion.notes[0].author.id !== review.authorId
        );
      })
      .map(discussion => Issue.fromGitlabDiscussion(discussion));
  }

  private async resolveBegin(projectId: number): Promise<Date | undefined> {
    const reviews = await this.findAll(projectId);
    if (reviews.length === 0) {
      return undefined;
    }
    return reviews.sort(
      (o1, o2) => o2.updatedAt.getTime() - o1.updatedAt.getTime(),
    )[0].updatedAt;
  }
}
