export class GitlabProject {
  id: number;
  name: string;
}

export class GitlabMergeRequest {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  assignee: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    name: string;
  };
  assignees: [
    {
      id: number;
      name: string;
    },
  ];
  timeStats: {
    timeEstimate: number;
    totalTimeSpent: number;
  };
}

export class GitlabDiscussion {
  id: string;
  notes: GitlabNote[];
}

export class GitlabNote {
  id: number;
  body: string;
  author: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  system: boolean;
}
