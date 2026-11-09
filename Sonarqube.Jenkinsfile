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
                        sh '''
                            if command -v sonar-scanner >/dev/null 2>&1; then
                                sonar-scanner \
                                  -Dsonar.projectKey=student-fullstack-app \
                                  -Dsonar.sources=. \
                                  -Dsonar.exclusions="**/node_modules/**,**/target/**,.next/**"
                            else
                                echo "Sonar scanner binary not directly in PATH, attempting fallback..."
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
                            )
                        ]
                    )
                    env.DEPLOY_ENV = deployInput['TARGET_ENV']
                    env.DEPLOY_ACTION = deployInput['ACTION']
                }
            }
        }

        stage('Execute Deployment') {
            steps {
                script {
                    def targetLabel = (env.DEPLOY_ENV == 'Production') ? 'production' : 'staging'
                    echo "Routing deployment to agent with label: ${targetLabel}"
                    
                    node(targetLabel) {
                        echo "Executing ${env.DEPLOY_ACTION} on node: ${NODE_NAME}"
                        
                        switch(env.DEPLOY_ACTION) {
                            case 'Standard Deploy (Recreate)':
                                sh '''
                                    docker compose down || true
                                    docker compose pull || true
                                    docker compose up -d --build --remove-orphans
                                '''
                                break
                            case 'Rolling Restart':
                                sh '''
                                    docker compose restart
                                '''
                                break
                            case 'Tear Down (Stop Only)':
                                sh '''
                                    docker compose down
                                '''
                                break
                            default:
                                error("Unknown deployment action: ${env.DEPLOY_ACTION}")
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            withCredentials([
                string(credentialsId: 'TELEGRAM_BOT_TOKEN', variable: 'BOT_TOKEN'),
                string(credentialsId: 'TELEGRAM_CHAT_ID', variable: 'CHAT_ID')
            ]) {
                sh '''
                    curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                      -d chat_id="${CHAT_ID}" \
                      -d parse_mode="Markdown" \
                      -d text="✅ *Pipeline Succeeded!*%0A*Project:* ${JOB_NAME}%0A*Build:* #${BUILD_NUMBER}%0A*Environment:* ${DEPLOY_ENV:-N/A}%0A*Action:* ${DEPLOY_ACTION:-N/A}"
                '''
            }
        }
        failure {
            withCredentials([
                string(credentialsId: 'TELEGRAM_BOT_TOKEN', variable: 'BOT_TOKEN'),
                string(credentialsId: 'TELEGRAM_CHAT_ID', variable: 'CHAT_ID')
            ]) {
                sh '''
                    curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                      -d chat_id="${CHAT_ID}" \
                      -d parse_mode="Markdown" \
                      -d text="❌ *Pipeline Failed!*%0A*Project:* ${JOB_NAME}%0A*Build:* #${BUILD_NUMBER}"
                '''
            }
        }
    }
}
