pipeline {
    agent none

    environment {
        SONAR_HOST_URL = 'https://sonar.lorvengroth.cfd'
    }

    stages {
        stage('Verify Environments') {
            parallel {
                stage('Verify Frontend (Node)') {
                    agent { label 'built-in' }
                    steps {
                        sh 'docker run --rm node:20-alpine sh -c "node -v && npm -v"'
                    }
                }
                stage('Verify Backend (Maven/Java)') {
                    agent { label 'built-in' }
                    steps {
                        sh 'docker run --rm maven:3.8.5-openjdk-17 sh -c "mvn -v && java -version"'
                    }
                }
            }
        }

        stage('SonarQube Code Analysis') {
            agent { label 'built-in' }
            steps {
                script {
                    withSonarQubeEnv('SonarQube-Server') {
                        sh '''
                            docker run --rm \
                              -e SONAR_HOST_URL="${SONAR_HOST_URL}" \
                              -e SONAR_TOKEN="${SONAR_AUTH_TOKEN}" \
                              -v "${WORKSPACE}:/usr/src" \
                              sonarsource/sonar-scanner-cli:latest \
                              -Dsonar.projectKey=student-fullstack-app \
                              -Dsonar.sources=/usr/src \
                              -Dsonar.java.binaries=. \
                              -Dsonar.exclusions="**/node_modules/**,**/target/**,.next/**"
                        '''
                    }
                }
            }
        }

        stage('SonarQube Quality Gate') {
            agent { label 'built-in' }
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    script {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }

        stage('Deployment Approval Gate') {
            steps {
                script {
                    try {
                        withCredentials([
                            string(credentialsId: 'TELEGRAM_BOT_TOKEN', variable: 'BOT_TOKEN'),
                            string(credentialsId: 'TELEGRAM_CHAT_ID', variable: 'CHAT_ID')
                        ]) {
                            sh '''
                                curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                                  -d chat_id="${CHAT_ID}" \
                                  -d parse_mode="Markdown" \
                                  -d text="⏳ *Approval Required!*%0A*Project:* ${JOB_NAME}\%0A*Build:* #${BUILD_NUMBER}%0APlease review and approve deployment in Jenkins." || true
                            '''
