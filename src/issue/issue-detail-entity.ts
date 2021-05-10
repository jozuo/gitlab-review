import * as moment from 'moment-timezone';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { GitlabNote } from '../gitalb/gitlab-dto';
import { Issue } from './issue.entity';

@Entity()
export class IssueDetail {
  @PrimaryColumn()
  id: number;

  @Column({ length: 1024 })
  body: string;

  @Column({ name: 'author_id' })
  authorId: number;

  @Column({ name: 'author_name', length: 64 })
  authorName: string;

  @Column({ name: 'updated_at' })
  updatedAt: Date = null;

  @ManyToOne(
    type => Issue, // eslint-disable-line @typescript-eslint/no-unused-vars
    issue => issue.details,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'issue_id' })
  issue: Issue;

  static fromGitlabNote(note: GitlabNote) {
    const entity = new IssueDetail();
    entity.id = note.id;
    entity.body = note.body;
    entity.authorId = note.author.id;
    entity.authorName = note.author.name;
    entity.updatedAt = moment(note.updatedAt).toDate();
    return entity;
  }
}
