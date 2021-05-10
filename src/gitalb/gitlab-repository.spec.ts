import * as moment from 'moment-timezone';
import { Project } from '../project/project.entity';
import { GitlabRepository } from './gitlab-repository';

describe('GitlabRepository', () => {
  let repository: GitlabRepository;
  beforeEach(() => {
    repository = new GitlabRepository();
  });

  describe('getProject', () => {
    let project: Partial<Project>;
    beforeEach(() => {
      project = new Project();
      project.gitlabUrl = process.env.GITLAB_URL;
      project.gitlabProjectId = 17267570;
      project.gitlabUserToken = process.env.GITLAB_USER_TOKEN;
    });

    test('gitlabProjectId, gitllabUserTokenが正しい場合、プロジェクトが取得できること', async () => {
      // -- exercise
      const response = await repository.getProject(project);
      // -- verify
      expect(response.id).toBe(project.gitlabProjectId);
      expect(response.name).toBe('serverless-lambda-codedeploy');
    });
    test('idが不正な場合、undefinedになること', async () => {
      // -- setup
      project.gitlabProjectId = 1;
      // -- exercise
      const response = await repository.getProject(project);
      // -- verify
      expect(response).toBeUndefined();
    });
    test('tokenが不正な場合、401:Unauthorized例外が発生すること', async () => {
      // -- setup
      project.gitlabUserToken = 'hogehoge';
      // -- exercise
      await expect(repository.getProject(project)).rejects.toThrowError(
        '{"message":"401 Unauthorized"}',
      );
    });
    test('idもtokenが不正な場合、401:Unauthorized例外が発生すること', async () => {
      // -- setup
      project.gitlabProjectId = 1;
      project.gitlabUserToken = 'hogehoge';
      // -- exercise
      await expect(repository.getProject(project)).rejects.toThrowError(
        '{"message":"401 Unauthorized"}',
      );
    });
  });

  describe('getMergeRequests', () => {
    let project: Partial<Project>;
    beforeEach(() => {
      project = new Project();
      project.gitlabUrl = process.env.GITLAB_URL;
      project.gitlabProjectId = 17478334;
      project.gitlabUserToken = process.env.GITLAB_USER_TOKEN;
    });
    test('起点を指定しない場合', async () => {
      // -- exercise
      const response = await repository.getMergeRequests(project);
      // -- verify
      expect(response.length).toBe(4);
      // --- 1つ目
      expect(response[0].id).toBe(52579919);
      expect(response[0].iid).toBe(4);
      expect(response[0].title).toBe('Resolve "add test2 markdown"');
      expect(response[0].timeStats.timeEstimate).toBe(0);
      expect(response[0].timeStats.totalTimeSpent).toBe(0);
      // --- 2つ目
      expect(response[1].id).toBe(52578912);
      expect(response[1].iid).toBe(3);
      expect(response[1].title).toBe('Resolve "add test markdown"');
      expect(response[1].timeStats.timeEstimate).toBe(1500);
      expect(response[1].timeStats.totalTimeSpent).toBe(1080);
      // --- 3つ目
      expect(response[2].id).toBe(52540698);
      expect(response[2].iid).toBe(2);
      expect(response[2].title).toBe('Resolve "add-readme-contants"');
      expect(response[2].timeStats.timeEstimate).toBe(3000);
      expect(response[2].timeStats.totalTimeSpent).toBe(4200);
      // --- 4つ目
      expect(response[3].id).toBe(52540642);
      expect(response[3].iid).toBe(1);
      expect(response[3].title).toBe('Resolve "modify-readme"');
      expect(response[3].timeStats.timeEstimate).toBe(5400);
      expect(response[3].timeStats.totalTimeSpent).toBe(3240);
    });
    test('起点してレコードが間引かれる場合', async () => {
      // -- setup
      const begin = moment('2020-03-14T03:19:13Z').toDate();
      // -- exercise
      const response = await repository.getMergeRequests(project, begin);
      // -- verify
      expect(response.length).toBe(3);
    });
    test('起点してレコードが間引かれない場合', async () => {
      // -- setup
      const begin = moment('2020-03-14T03:19:12Z').toDate();
      // -- exercise
      const response = await repository.getMergeRequests(project, begin);
      // -- verify
      expect(response.length).toBe(4);
    });
  });

  describe('getDiscussions', () => {
    let project: Partial<Project>;
    beforeEach(() => {
      project = new Project();
      project.gitlabUrl = process.env.GITLAB_URL;
      project.gitlabProjectId = 17478334;
      project.gitlabUserToken = process.env.GITLAB_USER_TOKEN;
    });
    test('ディスカッションが取得できる場合', async () => {
      // -- setup
      const mergeRequestId = 3;
      // -- exercise
      const discussions = await repository.getDiscussions(
        project,
        mergeRequestId,
      );
      // -- verify
      expect(discussions.length).toBe(5);
      discussions.forEach(discussion => {
        expect(discussion.notes.length).toBeGreaterThan(0);
        discussion.notes.forEach(note => {
          expect(note.system).toBeFalsy();
        });
      });
    });
  });
});
