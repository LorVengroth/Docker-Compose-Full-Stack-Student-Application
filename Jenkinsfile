pipeline {
    agent any

    environment {
        DEPLOY_ACTION = ''
        CLEAN_VOLUMES = ''
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
                                    choices: ['Standard Deploy (Recreate)', 'Rolling Restart', 'Tear Down (Stop Only)'],
                                    description: 'Select the deployment action for Docker Compose'
                                ),
                                booleanParam(
                                    name: 'REMOVE_OLD_VOLUMES',
                                    defaultValue: false,
                                    description: 'Check to wipe database volumes (docker compose down -v)'
                                )
                            ]
                        )

                        env.DEPLOY_ENV = userInput.TARGET_ENVIRONMENT
                        env.DEPLOY_ACTION = userInput.ACTION
                        env.CLEAN_VOLUMES = userInput.REMOVE_OLD_VOLUMES
                    }
                }
            }
        }

        stage('Execute Deployment') {
            steps {
                echo "=== Executing deployment to: ${env.DEPLOY_ENV} ==="

                script {
                    if (env.DEPLOY_ACTION == 'Tear Down (Stop Only)') {
                        sh 'docker compose down'
                    } else {
                        if (env.CLEAN_VOLUMES == 'true') {
                            sh 'docker compose down -v'
                        } else {
                            sh 'docker compose down'
                        }
                        sh 'docker compose up -d'
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