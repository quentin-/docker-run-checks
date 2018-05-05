## docker-run-checks

A webservice that pulls images, run commands, and report executions success.

```bash
docker-compose up
```

#### Creating a new check:

```bash
curl -X POST http://localhost:5000/api/v1/checks \
     -H 'Content-Type: application/json' \
     -d '{
           "images": [
             {
               "name": "ubuntu:latest",
               "cmd": [ "ls", "/bin" ]
             },
             {
               "name": "ubuntu:latest",
               "cmd": [ "ls", "/foo" ]
             }
           ],
           "webhooks": {
             "success": "http://localhost:8080/success",
             "failure": "http://localhost:8080/failure"
           }
         }'
```

<img width="1026" alt="screen shot 2018-05-05 at 4 07 10 pm" src="https://user-images.githubusercontent.com/2709086/39668285-763b338a-507e-11e8-85ed-bd1bf5438104.png">