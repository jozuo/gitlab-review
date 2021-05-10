import * as camelcaseKeys from 'camelcase-keys';
import * as dotenv from 'dotenv';
import { CoreOptions } from 'request';
import * as request from 'request-promise-native';
import { Project } from '../project/project.entity';
dotenv.config();

const API_CALL_WAIT = 200;

export class GitlabRequester {
  constructor(private readonly project: Partial<Project>) {}

  public async get<T>(url: string, options: CoreOptions = {}): Promise<T> {
    const newOptions = this.addCommonOptions(options);

    await this.sleep(API_CALL_WAIT);
    return (camelcaseKeys(
      await request.get(this.getGitlabApiEndpoint() + url, newOptions),
      {
        deep: true,
      },
    ) as any) as T;
  }

  public async getRaw(url: string, options: CoreOptions = {}): Promise<string> {
    const newOptions = this.addRawOptions(options);
    await this.sleep(API_CALL_WAIT);
    return await request.get(this.getGitlabApiEndpoint() + url, newOptions);
  }

  public async post(url: string, options: CoreOptions): Promise<void> {
    const newOptions = this.addRawOptions(options);
    await this.sleep(API_CALL_WAIT);
    await request.post(this.getGitlabApiEndpoint() + url, newOptions);
  }

  public async getList<T>(
    url: string,
    options: CoreOptions = {},
  ): Promise<T[]> {
    let page = 1;
    let hasNext = true;
    let datas: T[] = [];
    while (hasNext) {
      const result = await this.getListCore(
        this.getGitlabApiEndpoint() + url,
        options,
        page++,
      );
      datas = datas.concat(result[0] as T[]);
      hasNext = result[1];
      await this.sleep(API_CALL_WAIT);
    }
    return datas;
  }

  private async getListCore<T>(
    url: string,
    options: CoreOptions,
    page: number,
  ): Promise<[T[], boolean]> {
    const newOptions = this.addCommonOptions(options) as any;
    // paging
    newOptions['resolveWithFullResponse'] = true;
    if (!newOptions.qs) {
      newOptions.qs = {};
    }
    newOptions.qs['page'] = page;
    newOptions.qs['per_page'] = 100;

    const response = await request.get(url, newOptions);
    const results = camelcaseKeys(response.body, { deep: true }) as any;
    const hasNext = Number(response.headers['x-total-pages']) > page;
    return [results, hasNext];
  }

  private addRawOptions(current: CoreOptions): CoreOptions {
    const options = Object.assign({}, current) as any;
    // authorization
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['PRIVATE-TOKEN'] = this.project.gitlabUserToken;

    return options;
  }

  private addCommonOptions(current: CoreOptions): CoreOptions {
    const options = this.addRawOptions(current);
    // format
    options.json = true;
    return options;
  }

  private sleep(milisec: number): Promise<void> {
    return new Promise((resolve): void => {
      setTimeout((): void => resolve(), milisec);
    });
  }

  private getGitlabApiEndpoint(): string {
    return `${this.project.gitlabUrl}/api/v4/projects/${this.project.gitlabProjectId}`;
  }
}
