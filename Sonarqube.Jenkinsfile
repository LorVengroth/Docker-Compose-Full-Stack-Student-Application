pipeline {
    agent none

    environment {
        SONAR_HOST_URL = 'https://sonar.lorvengroth.cfd'
    }

    stages {
        // 1. Verify Environments (Backend & Frontend)
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

        // 2. SonarQube Scan Analysis
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
                              -Dsonar.exclusions="**/node_modules/**,**/target/**,.next/**" || true
                        '''
                    }
                }
            }
        }

        // 3. Input Parameter (Select Staging or Production)
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

        // 4. Deploy to Selected Slave Node
        stage('Execute Deployment') {
            steps {
                script {
                    def targetLabel = (env.DEPLOY_ENV == 'Production') ? 'production' : 'staging'
                    echo "Routing deployment to agent node: ${targetLabel}"

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
        success {
            echo "Pipeline succeeded! Deployed ${env.JOB_NAME} to ${env.DEPLOY_ENV}."
        }
        failure {
            echo "Pipeline failed on build #${BUILD_NUMBER}."
        }
    }
}
