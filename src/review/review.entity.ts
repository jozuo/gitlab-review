import * as moment from 'moment';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { GitlabMergeRequest } from '../gitalb/gitlab-dto';
import { Issue } from '../issue/issue.entity';

@Entity()
export class Review {
  @PrimaryColumn()
  id: number;

  @Column()
  iid: number;

  @Column({ length: 512 })
  title: string;

  @Column({ name: 'author_id' })
  authorId: number;

  @Column({ name: 'author_name', length: 64 })
  authorName: string;

  @Column({ name: 'assignee_id', nullable: true })
  assigneeId: number;

  @Column({ name: 'assignee_name', nullable: true, length: 64 })
  assigneeName: string;

  @Column()
  estimate: number;

  @Column()
  spent: number;

  @Column({ name: 'updated_at' })
  updatedAt: Date = null;

  @Column({ name: 'project_id' })
  projectId: number;

  @OneToMany(
    type => Issue, // eslint-disable-line @typescript-eslint/no-unused-vars
    issue => issue.review,
  )
  issues: Issue[];

  static fromMergeRequest(projectId: number, mergeRequest: GitlabMergeRequest) {
    const entity = new Review();
    entity.id = mergeRequest.id;
    entity.iid = mergeRequest.iid;
    entity.title = mergeRequest.title;
    entity.authorId = mergeRequest.author.id;
    entity.authorName = mergeRequest.author.name;
    if (mergeRequest.assignee) {
      entity.assigneeId = mergeRequest.assignee.id;
      entity.assigneeName = mergeRequest.assignee.name;
    }
    entity.estimate = mergeRequest.timeStats.timeEstimate;
    entity.spent = mergeRequest.timeStats.totalTimeSpent;
    entity.updatedAt = moment(mergeRequest.updatedAt).toDate();
    entity.projectId = projectId;
    return entity;
  }
}
