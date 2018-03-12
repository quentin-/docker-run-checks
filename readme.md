## docker-run-checks

Webservice that pulls and run docker commands.

#### Creating a new check:

```bash
curl -X POST http://localhost:3000/api/v1/checks \
     -H 'Content-Type: application/json' \
     -d '{
           "images": [
             {
               "name": "ubuntu:latest",
               "cmd": [ "ls", "-l", "/bin" ]
             },
             {
               "name": "ubuntu:latest",
               "cmd": [ "ls", "-l", "/bar" ]
             }
           ],
           "webhooks": {
             "success": "https://localhost:8080g? success=1",
             "failure": "https://localhost:8080g? failure=1"
           }
         }'
```

```json
{ "check": 4 }
```

#### Getting a check result:

```bash
curl http://localhost:3000/api/v1/checks/4
```

```json
{
  "checks": [
    {
      "pull_logs": [],
      "name": "ubuntu:latest",
      "cmd": ["ls", "-l", "/"],
      "executation_status_code": 0,
      "execution_logs": [
        "total 64",
        "drwxr-xr-x   2 root root 4096 Feb 28 19:14 bin",
        "drwxr-xr-x   2 root root 4096 Apr 12  2016 boot",
        "drwxr-xr-x   5 root root  360 Mar 12 00:24 dev",
        "drwxr-xr-x   1 root root 4096 Mar 12 00:24 etc",
        "drwxr-xr-x   2 root root 4096 Apr 12  2016 home",
        "drwxr-xr-x   8 root root 4096 Sep 13  2015 lib",
        "drwxr-xr-x   2 root root 4096 Feb 28 19:14 lib64",
        "drwxr-xr-x   2 root root 4096 Feb 28 19:13 media",
        "drwxr-xr-x   2 root root 4096 Feb 28 19:13 mnt",
        "drwxr-xr-x   2 root root 4096 Feb 28 19:13 opt",
        "dr-xr-xr-x 164 root root    0 Mar 12 00:24 proc",
        "drwx------   2 root root 4096 Feb 28 19:14 root",
        "drwxr-xr-x   1 root root 4096 Feb 28 19:14 run",
        "drwxr-xr-x   1 root root 4096 Mar  6 22:17 sbin",
        "drwxr-xr-x   2 root root 4096 Feb 28 19:13 srv",
        "dr-xr-xr-x  13 root root    0 Mar 11 06:59 sys",
        "drwxrwxrwt   2 root root 4096 Feb 28 19:14 tmp",
        "drwxr-xr-x   1 root root 4096 Feb 28 19:13 usr",
        "drwxr-xr-x   1 root root 4096 Feb 28 19:14 var"
      ],
      "download_logs": [
        "Pulling from library/ubuntu",
        "Pulling from library/ubuntu",
        "Digest: sha256:e348fbbea0e0a0a49bd6",
        "Status: Image is up to date for ubuntu:latest",
        "Digest: sha256:e348fbbea0e0a0a49bd6",
        "Status: Image is up to date for ubuntu:latest"
      ]
    },
    {
      "name": "ubuntu:latest",
      "cmd": ["ls", "-l", "/bar"],
      "executation_status_code": 2,
      "execution_logs": ["ls: cannot access '/bar': No such file or directory"],
      "download_logs": [
        "Pulling from library/ubuntu",
        "Pulling from library/ubuntu",
        "Digest: sha256:e348fbbea0e0a0e73ab0370da49bd6",
        "Status: Image is up to date for ubuntu:latest",
        "Digest: sha256:e348fbbea0e0a0e73ab0370da49bd6",
        "Status: Image is up to date for ubuntu:latest"
      ]
    }
  ],
  "state": "complete",
  "created_at": "1520814239430",
  "updated_at": "1520814254577"
}
```

A web UI is also available to see a job status:

<img width="1137" alt="screen shot 2018-03-11 at 5 44 34 pm" src="https://user-images.githubusercontent.com/2709086/37260736-ebbfdd00-2553-11e8-9edd-bc15ff3e5e82.png">
