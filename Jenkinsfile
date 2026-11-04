pipeline {
    agent any

    environment {
        DEPLOY_ACTION = ''
        DEPLOY_ENV = ''
    }

    stages {
        stage('Build Containers') {
            steps {
                echo '=== Compiling and building all Docker images ==='
                sh 'docker compose build'
            }
        }

        stage('Deployment Approval Gate') {
            steps {
                echo '=== Pipeline paused: Waiting for manual approval ==='
                timeout(time: 15, unit: 'MINUTES') {
                    script {
                        def userInput = input(
                            id: 'DeployGate',
                            message: 'Do you approve the deployment to the target server?',
                            ok: 'Confirm & Execute',
                            parameters: [
                                choice(
                                    name: 'TARGET_ENVIRONMENT',
                                    choices: ['Production', 'Staging'],
                                    description: 'Select the destination environment'
                                ),
                                choice(
                                    name: 'ACTION',
                                    choices: [
                                        'Rolling Restart',
                                        'Standard Deploy (Recreate)',
                                        'Tear Down (Stop Only)'
                                    ],
                                    description: 'Select the deployment action for Docker Compose'
                                )
                            ]
                        )

                        env.DEPLOY_ENV = userInput.TARGET_ENVIRONMENT
                        env.DEPLOY_ACTION = userInput.ACTION
                    }
                }
            }
        }

        stage('Execute Deployment') {
            steps {
                echo "=== Executing deployment to: ${env.DEPLOY_ENV} ==="

                script {
                    switch (env.DEPLOY_ACTION) {
                        case 'Rolling Restart':
                            echo 'Executing rolling update: recreating updated services in-place...'
                            sh 'docker compose up -d'
                            break

                        case 'Standard Deploy (Recreate)':
                            echo 'Executing full recreate: stopping all containers before recreation...'
                            sh 'docker compose down'
                            sh 'docker compose up -d'
                            break

                        case 'Tear Down (Stop Only)':
                            echo 'Tearing down all containers and networks...'
                            sh 'docker compose down'
                            break

                        default:
                            error("Unknown deployment action: ${env.DEPLOY_ACTION}")
                            break
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                echo '=== Verifying service health after deployment ==='
                sleep time: 5, unit: 'SECONDS'
                sh 'docker compose ps'
            }
        }
    }

    post {
        always {
            sh 'docker compose ps'
        }
        aborted {
            echo 'Pipeline was aborted by the user.'
        }
        failure {
            echo 'Pipeline execution encountered a failure!'
        }
    }
}
