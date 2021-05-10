import { HttpStatus, Injectable } from '@nestjs/common';
import { CoreOptions } from 'request';
import { Project } from '../project/project.entity';
import {
  GitlabDiscussion,
  GitlabMergeRequest,
  GitlabProject,
} from './gitlab-dto';
import { GitlabRequester } from './gitlab-requester';

@Injectable()
export class GitlabRepository {
  async getProject(project: Partial<Project>): Promise<GitlabProject> {
    try {
      return await new GitlabRequester(project).get<GitlabProject>('/');
    } catch (err) {
      if (this.isNotFound(err)) {
        return undefined;
      }
      throw err;
    }
  }

  async getMergeRequests(
    project: Partial<Project>,
    begin?: Date,
  ): Promise<GitlabMergeRequest[]> {
    /* eslint-disable @typescript-eslint/camelcase */
    const options: CoreOptions = {
      qs: {
        updated_after: begin?.toISOString(),
      },
    };
    /* eslint-enable @typescript-eslint/camelcase */
    return await new GitlabRequester(project).getList<GitlabMergeRequest>(
      '/merge_requests',
      options,
    );
  }

  async getDiscussions(
    project: Partial<Project>,
    mergeRequestId: number,
  ): Promise<GitlabDiscussion[]> {
    const discussions = await new GitlabRequester(project).getList<
      GitlabDiscussion
    >(`/merge_requests/${mergeRequestId}/discussions`);

    // システムが登録したNoteは除去
    discussions.forEach(discussions => {
      discussions.notes = discussions.notes.filter(note => !note.system);
    });
    // Notesが紐付かないDiscussionは除去
    return discussions.filter(discussion => discussion.notes.length > 0);
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  private isNotFound(err: any): boolean {
    if (!err.statusCode) {
      return false;
    }
    return err.statusCode === HttpStatus.NOT_FOUND;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
