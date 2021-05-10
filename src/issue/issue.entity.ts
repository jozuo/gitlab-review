import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GitlabDiscussion } from '../gitalb/gitlab-dto';
import { Review } from '../review/review.entity';
import { IssueDetail } from './issue-detail-entity';

@Entity()
export class Issue {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    type => Review, // eslint-disable-line @typescript-eslint/no-unused-vars
    review => review.issues,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @OneToMany(
    type => IssueDetail, // eslint-disable-line @typescript-eslint/no-unused-vars
    detail => detail.issue,
  )
  details: IssueDetail[];

  static fromGitlabDiscussion(discussion: GitlabDiscussion) {
    const entity = new Issue();
    entity.details = discussion.notes.map(note =>
      IssueDetail.fromGitlabNote(note),
    );
    return entity;
  }
}
