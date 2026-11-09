pipeline {
    agent none

    environment {
        TG_TOKEN        = credentials('TELEGRAM_BOT_TOKEN')
        TG_CHAT_ID      = credentials('TELEGRAM_CHAT_ID')
        SONAR_HOST_URL   = 'https://sonar.lorvengroth.cfd'
        SCANNER_HOME    = tool 'SonarQubeScanner'
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
                withSonarQubeEnv('SonarQube-Server') {
                    sh """
                    ${SCANNER_HOME}/bin/sonar-scanner \
                      -Dsonar.projectKey=student-fullstack-app \
                      -Dsonar.sources=. \
                      -Dsonar.exclusions=**/node_modules/**,**/target/**
                    """
                }
            }
        }

        stage('SonarQube Quality Gate') {
            agent { label 'built-in' }
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
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
                            choice(name: 'TARGET_ENV', choices: ['Staging', 'Production'], description: 'Select deployment environment'),
                            choice(name: 'ACTION', choices: ['Standard Deploy (Recreate)', 'Rolling Restart', 'Tear Down (Stop Only)'], description: 'Select action')
                        ]
                    )
                    env.DEPLOY_ENV = deployInput['TARGET_ENV']
                    env.DEPLOY_ACTION = deployInput['ACTION']
                }
            }
        }

        stage('Execute Deployment') {
            agent {
                node {
                    label (env.DEPLOY_ENV == 'Production' ? 'production' : 'staging')
                }
            }
            steps {
                script {
                    echo "Executing ${env.DEPLOY_ACTION} on ${env.DEPLOY_ENV} Node..."
                    if (env.DEPLOY_ACTION == 'Standard Deploy (Recreate)') {
                        sh 'docker compose down || true'
                        sh 'docker compose up -d --build'
                    } else if (env.DEPLOY_ACTION == 'Rolling Restart') {
                        sh 'docker compose restart'
                    } else if (env.DEPLOY_ACTION == 'Tear Down (Stop Only)') {
                        sh 'docker compose down'
                    }
                }
            }
        }
    }

    post {
        success {
            sh """
            curl -s -X POST https://api.telegram.org/bot${TG_TOKEN}/sendMessage \
              -d chat_id=${TG_CHAT_ID} \
              -d parse_mode=Markdown \
              -d text="✅ *Pipeline Succeeded!*%0A*Project:* ${env.JOB_NAME}%0A*Build:* #${env.BUILD_NUMBER}%0A*Environment:* ${env.DEPLOY_ENV ?: 'N/A'}"
            """
        }
        failure {
            sh """
            curl -s -X POST https://api.telegram.org/bot${TG_TOKEN}/sendMessage \
              -d chat_id=${TG_CHAT_ID} \
              -d parse_mode=Markdown \
              -d text="❌ *Pipeline Failed!*%0A*Project:* ${env.JOB_NAME}%0A*Build:* #${env.BUILD_NUMBER}"
            """
        }
    }
}
