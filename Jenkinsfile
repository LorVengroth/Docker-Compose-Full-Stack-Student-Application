pipeline {
    agent none

    environment {
        DEPLOY_ACTION = ''
        DEPLOY_ENV    = ''
    }

    stages {
        stage('Build Containers') {
            agent any
            steps {
                echo '=== Compiling and building all Docker images ==='
                sh 'docker compose build'
            }
        }

        stage('Deployment Approval Gate') {
            agent none
            steps {
                echo '=== Pipeline paused: Waiting for manual approval (Zero Resources Held) ==='
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

                        // Safe map key extraction to prevent 'null'
                        env.DEPLOY_ENV    = userInput['TARGET_ENVIRONMENT']
                        env.DEPLOY_ACTION = userInput['ACTION']

                        echo "Selected Environment: ${env.DEPLOY_ENV}"
                        echo "Selected Action: ${env.DEPLOY_ACTION}"
                    }
                }
            }
        }

        stage('Execute Deployment') {
            agent any
            steps {
                echo "=== Executing deployment to: ${env.DEPLOY_ENV} ==="

                script {
                    switch (env.DEPLOY_ACTION) {
                        case 'Rolling Restart':
                            echo 'Executing rolling update: recreating updated services in-place...'
                            sh 'docker compose up -d --build'
                            break

                        case 'Standard Deploy (Recreate)':
                            echo 'Executing full recreate: stopping all containers before recreation...'
                            sh 'docker compose down'
                            sh 'docker compose up -d --build'
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
            agent any
            steps {
                echo '=== Verifying service health after deployment ==='
                sleep time: 5, unit: 'SECONDS'
                sh 'docker compose ps'
            }
        }
    }

    post {
        always {
            node('built-in') {
                sh 'docker compose ps'
            }
        }
        aborted {
            echo 'Pipeline was aborted by the user.'
        }
        failure {
            echo 'Pipeline execution encountered a failure!'
        }
    }
}
