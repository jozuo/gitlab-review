# レビュー記録作成ツール

## 概要

GitLabのMergeRequestからレビュー議事録を作成するツールです。  
レビュー時間 および レビュー指摘への対応時間は、GitLabの[Time Tracking機能](https://docs.gitlab.com/ee/user/project/time_tracking.html)を利用して計測します。


## 前提条件

このツールでレビュー記録を作成する場合は、レビューが以下のルールに則って行われている必要があります。

### ルール

- 1指摘につき1コメント作成されていること。
- ディスカッションは、指摘へのリプライで行うこと。
- レビュー時間が`/estimate`で記録されていること。
    - `/estimate`を複数回実行すると 時間が上書きされます。レビュー時間を追加したい場合は、最終的な合算値を`/estimate`で登録してください。
- レビュー指摘への対応時間が`/spend`で記録されていること。
    - `/spend`を複数回実行すると 時間が加算されます。対応毎に`/spend`を登録する他に`/spend -3h`のように減算したり、 `/remove_time_spent`を利用して登録された時間を削除することも可能です。


## 利用方法
### プロジェクト登録

レビュー記録を作成するGitLabリポジトリを登録します。

- エンドポイント
    - /projects
- メソッド
    - POST
- リクエストボディー
    - gitlabUrl
    - gitlabProjectId
    - gitlabUserToken
- レスポンス
    - ステータスコード: 201(CREATED)
    - ボディー: 登録したプロジェクト情報

#### 例

- リクエスト

```
$ curl -H 'Content-Type:application/json' \
    -d '{"gitlabUrl":"https://gitlab.com", "gitlabProjectId":17478334,"gitlabUserToken":"xxxxxxxxxxxxxxxxxxxx", }' \
    http://localhost:3000/projects
```

- レスポンス

```json
{
  "id": 1,
  "gitlabUrl": "https://gitlab.com",
  "gitlabProjectId": 17478334,
  "gitlabProjectName": "mr-test"
}
```


### プロジェクト一覧取得

登録されているプロジェクトの一覧を取得します。

- エンドポイント
    - /projects
- メソッド
    - GET
- レスポンス
    - ステータスコード: 200(OK)
    - ボディー: 登録されているプロジェクト情報一覧

#### 例

- リクエスト

```
$ curl -H 'Content-Type:application/json' \
    http://localhost:3000/projects
```

- レスポンス

```json
[
  {
    "id": 1,
    "gitlabUrl": "https://gitlab.com",
    "gitlabProjectId": 17478334,
    "gitlabProjectName": "mr-test"
  },
  {
    "id": 2,
    "gitlabUrl": "http://easy.apo.epson.net/gitlab",
    "gitlabProjectId": 664,
    "gitlabProjectName": "m-tracer-golf"
  }
]
```

### レビュー記録集計

指定されたプロジェクトのレビュー記録を集計します。レビュー記録として扱われるのは以下の条件に該当するMergeReqeustになります。

- システムが登録したNote および MergeRequestのAuthorが作成したNoteでディスカッションが行われていないNoteを除外。
- 上記除外をした結果、Noteが一つでも存在しているMergeRequest

また、集計処理は非同期処理で実行されます。

- エンドポイント
    - /projects/${projectId}/reviews/collect
- メソッド
    - POST
- レスポンス
    - ステータスコード: 202(ACCEPTED)
    - ボディー: なし

#### 例

- リクエスト

```
$ curl -H 'Content-Type:application/json'\
    -X POST \
    http://localhost:3000/projects/1/reviews/collect
```


### レビュー一覧取得

指定されたプロジェクトのレビュー一覧を取得します。

- エンドポイント
    - /projects/${projectId}/reviews
- メソッド
    - GET
- レスポンス
    - ステータスコード: 200(OK)
    - ボディー: レビュー一覧

#### 例

- リクエスト

```
$ curl -H 'Content-Type:application/json' \
    http://localhost:3000/projects/1/reviews
```

- レスポンス

```json
[
  {
    "updatedAt": "2020-03-14T22:30:47.000Z",
    "id": 52578912,
    "iid": 3,
    "title": "Resolve \"add test markdown\"",
    "authorId": 5610040,
    "authorName": "Jozuo Dev",
    "assigneeId": 3512921,
    "assigneeName": "Toru Mori",
    "estimate": 1500,
    "spent": 1080,
    "projectId": 1
  },
  {
    "updatedAt": "2020-03-15T00:16:16.000Z",
    "id": 52579919,
    "iid": 4,
    "title": "Resolve \"add test2 markdown\"",
    "authorId": 5610040,
    "authorName": "Jozuo Dev",
    "assigneeId": 3512921,
    "assigneeName": "Toru Mori",
    "estimate": 0,
    "spent": 0,
    "projectId": 1
  }
]
```

### レビュー指摘一覧取得

指定されたプロジェクト、レビューにおけるの指摘一覧を取得します。

- エンドポイント
    - /projects/${projectId}/issues
- メソッド
    - GET
- パラメータ
    - reviewIid
- レスポンス
    - ステータスコード: 200(OK)
    - ボディー: 指摘一覧

#### 例

- リクエスト

```
$ curl -H 'Content-Type:application/json' \
    http://localhost:3000/projects/1/issues?reviewIid=4
```

- レスポンス

```json
[
  {
    "id": 9,
    "details": [
      {
        "updatedAt": "2020-03-15T00:14:56.000Z",
        "id": 305057381,
        "body": "指摘1",
        "authorId": 3512921,
        "authorName": "Toru Mori"
      },
      {
        "updatedAt": "2020-03-15T00:14:56.000Z",
        "id": 305057439,
        "body": "指摘1へのリプライ",
        "authorId": 5610040,
        "authorName": "Jozuo Dev"
      }
    ]
  },
  {
    "id": 10,
    "details": [
      {
        "updatedAt": "2020-03-15T00:14:30.000Z",
        "id": 305057395,
        "body": "指摘2",
        "authorId": 3512921,
        "authorName": "Toru Mori"
      },
      {
        "updatedAt": "2020-03-15T00:15:02.000Z",
        "id": 305057445,
        "body": "指摘2へのリプライ",
        "authorId": 5610040,
        "authorName": "Jozuo Dev"
      }
    ]
  },
  {
    "id": 11,
    "details": [
      {
        "updatedAt": "2020-03-15T00:15:15.000Z",
        "id": 305057414,
        "body": "指摘3",
        "authorId": 3512921,
        "authorName": "Toru Mori"
      },
      {
        "updatedAt": "2020-03-15T00:15:15.000Z",
        "id": 305057456,
        "body": "指摘3へのリプライ",
        "authorId": 5610040,
        "authorName": "Jozuo Dev"
      },
      {
        "updatedAt": "2020-03-15T00:15:30.000Z",
        "id": 305057466,
        "body": "指摘3リプライへのリプライ",
        "authorId": 3512921,
        "authorName": "Toru Mori"
      }
    ]
  },
  {
    "id": 12,
    "details": [
      {
        "updatedAt": "2020-03-15T00:16:11.000Z",
        "id": 305057498,
        "body": "確認 しました。マージします。",
        "authorId": 3512921,
        "authorName": "Toru Mori"
      }
    ]
  }
]
```
