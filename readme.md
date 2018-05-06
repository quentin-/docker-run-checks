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
               "name": "node:7.0.0",
               "cmd": [ "node", "-p", "function f(a = 0){}" ]
             },
             {
               "name": "node:0.12.18",
               "cmd": [ "node", "-p", "function f(a = 0){}" ]
             }
           ],
           "webhooks": {
             "success": "http://localhost:8080/success",
             "failure": "http://localhost:8080/failure"
           }
         }'
```

<img width="943" alt="screen shot 2018-05-05 at 9 03 46 pm" src="https://user-images.githubusercontent.com/2709086/39669665-d3262ab8-50a7-11e8-89a4-31ab719430ee.png">
