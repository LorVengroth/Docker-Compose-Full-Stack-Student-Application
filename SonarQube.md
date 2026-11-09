## install SonarQube
```bash
sudo docker run -d --name sonarqube \
  -p 127.0.0.1:9000:9000 \
  --restart always \
  sonarqube:lts-community
  ```
## inspect sonarqube log
```bash
sudo docker logs -f sonarqube
```
