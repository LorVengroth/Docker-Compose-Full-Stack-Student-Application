# THE PROJECT DEPENDENCY 
- Spring web
- Spring data jpa
- Postgresql driver
- Lombok 

```bash
docker run --name student-postgres -e POSTGRES_DB=studentdb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5433:5433 -d postgres:16-alpine
```