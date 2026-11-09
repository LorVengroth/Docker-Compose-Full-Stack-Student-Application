pipeline {
    agent none

    environment {
        SONAR_HOST_URL = 'https://sonar.lorvengroth.cfd'
    }

    stages {
        stage('Verify Environments') {
            parallel {
                stage('Verify Frontend (Node)') {
                    agent {
                        docker {
                            image 'node:20-alpine'
                            reuseNode false
                        }
                    }
                    steps {
                        sh 'node -v'
                        sh 'npm -v'
                    }
                }
                stage('Verify Backend (Maven/Java)') {
                    agent {
                        docker {
                            image 'maven:3.8.5-openjdk-17'
                            reuseNode false
                        }
                    }
                    steps {
                        sh 'mvn -v'
                        sh 'java -version'
                    }
                }
            }
        }

        stage('SonarQube Code Analysis') {
            agent { label 'built-in' }
            steps {
                script {
                    withSonarQubeEnv('SonarQube-Server') {
                        // Scan Java backend និង Next.js frontend
                        sh '''
                            if command -v sonar-scanner >/dev/null 2>&1; then
                                sonar-scanner \
                                  -Dsonar.projectKey=student-fullstack-app \
                                  -Dsonar.sources=. \
                                  -Dsonar.exclusions="**/node_modules/**,**/target/**,.next/**"
                            else
                                echo "Sonar scanner binary not directly in PATH, trying maven/direct scanner fallback..."
                                cd student-api && mvn clean compile sonar:sonar \
                                  -Dsonar.projectKey=student-fullstack-app || true
                            fi
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
            agent none
            steps {
                script {
                    def deployInput = input(
                        id: 'DeployGate',
                        message: 'Approve Deployment?',
                        parameters: [
                            choice(
                                name: 'TARGET_ENV',
                                choices: ['Staging', 'Production'],
                                description: 'Select deployment environment'
                            ),
                            choice(
                                name: 'ACTION',
                                choices: ['Standard Deploy (Recreate)', 'Rolling Restart', 'Tear Down (Stop Only)'],
                                description: 'Select deployment action'
