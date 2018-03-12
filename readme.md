## docker-run-checks

A webservice that pulls images, run commands, and report executions success.

#### Creating a new check:

```bash
curl -X POST http://localhost:3000/api/v1/checks \
     -H 'Content-Type: application/json' \
     -d '{
           "images": [
             {
               "name": "acmeinc/web-client:master",
               "cmd": [
                  "./bin/check-graphql-schema",
                  "-url", "https://ci.acmeinc.com/gql-schemas/[tag].schema.json"
                ]
             },
             {
               "name": "acmeinc/ios-clint:master",
               "cmd": [
                  "./bin/check-graphql-schema",
                  "-url", "https://ci.acmeinc.com/gql-schemas/[tag].schema.json"
                ]
             },
           ],
           "webhooks": {
             "success": "https://ci.acmeinc.com/graphql-schema-check?success=1&commit=[tag]",
             "failure": "https://ci.acmeinc.com/graphql-schema-check?failure=1&commit=[tag]"
           }
         }'
```

```json
{ "check": 1 }
```

#### Getting a check result:

```bash
curl http://localhost:3000/api/v1/checks/1
```

```json
{
  "checks": [
    {
      "name": "acmeinc/web-client:master",
      "cmd": [
        "./bin/check-graphql-schema",
        "--url",
        "https://ci.acmeinc.com/gql-schemas/[tag].schema.json"
      ],
      "executation_status_code": 0,
      "execution_logs": ["ok"],
      "download_logs": [
        "Pulling from acmeinc/web-client:master",
        "Digest: sha256:e348fbbea0e0a0a49bd6",
        "Status: Image is up to date for acmeinc/web-client:master"
      ]
    },
    {
      "name": "acmeinc/ios-client:master",
      "cmd": [
        "./bin/check-graphql-schema",
        "--url",
        "https://ci.acmeinc.com/gql-schemas/[tag].schema.json"
      ],
      "executation_status_code": 1,
      "execution_logs": [
        "/Users/user/acmeinc/ios-client/queries/someQuery.gql",

        "8:5  error  Cannot query field \"someRemovedFieldA\" on type \"SomeType\"  graphql/template-strings",
        "8:5  error  Cannot query field \"someRemovedFieldB\" on type \"SomeType\"  graphql/template-strings",

        "✖ 2 problem (1 error, 0 warnings)"
      ],
      "download_logs": [
        "Pulling from acmeinc/ios-client:master",
        "Digest: sha256:e348fbbea0e0a0a49bd6",
        "Status: Image is up to date for acmeinc/ios-client:master"
      ]
    }
  ],
  "state": "complete",
  "created_at": "1520814239430",
  "updated_at": "1520814254577"
}
```

<img width="1270" alt="screen shot 2018-03-11 at 9 13 39 pm" src="https://user-images.githubusercontent.com/2709086/37265521-2fafd55c-2571-11e8-9f4a-14a343c34591.png">
