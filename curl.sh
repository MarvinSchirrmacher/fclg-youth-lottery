curl --request POST \ 'https://data.mongodb-api.com/app/data-zxqge/endpoint/data/beta/action/findOne' \
    --header 'Content-Type: application/json' \
    --header 'Access-Control-Request-Headers: *' \
    --header 'api-key: idcvmeus' \
    --data-raw '{
        "collection":"participations",
        "database":"fclg-youth-lottery",
        "dataSource":"Cluster0",
        "filter": { "firstName": "Marvin" }
    }'

curl --location --request POST 'https://data.mongodb-api.com/app/data-zxqge/endpoint/data/beta/action/findOne' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJiYWFzX2RldmljZV9pZCI6IjYxZTBhNGM5ZjliZDdjYjMzNmY2OWE5ZiIsImJhYXNfZG9tYWluX2lkIjoiNjFjZGU5ZTQ4MGY1YmI2NzFkMjIwYmJiIiwiZXhwIjoxNjQyMTE0MDAxLCJpYXQiOjE2NDIxMTIyMDEsImlzcyI6IjYxZTBhNGM5ZjliZDdjYjMzNmY2OWFhMCIsInN0aXRjaF9kZXZJZCI6IjYxZTBhNGM5ZjliZDdjYjMzNmY2OWE5ZiIsInN0aXRjaF9kb21haW5JZCI6IjYxY2RlOWU0ODBmNWJiNjcxZDIyMGJiYiIsInN1YiI6IjYxZTBhNGM5ZjliZDdjYjMzNmY2OWE5ZCIsInR5cCI6ImFjY2VzcyJ9.Ishb0vcJsHlS4kHD0ss6pxIx1sxxts1La8XAArHTFrc' \
    --header 'Access-Control-Request-Headers: *' \
    --header 'api-key: idcvmeus' \
    --data-raw '{
        "collection":"participations",
        "database":"fclg-youth-lottery",
        "dataSource":"Cluster0",
        "projection": {"_id": 1}
    }'