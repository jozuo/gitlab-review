import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'gitlab_url', length: 128 })
  gitlabUrl: string;

  @Column({ name: 'gitlab_project_id' })
  gitlabProjectId: number;

  @Column({ name: 'gitlab_project_name', length: 512 })
  gitlabProjectName: string;

  @Column({ name: 'gitlab_user_token', length: 32 })
  gitlabUserToken: string;
}
