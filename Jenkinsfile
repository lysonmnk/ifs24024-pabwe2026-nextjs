pipeline {
    agent none

    environment {
        SONAR_SCANNER_OPTS = "-Dsonar.host.url=http://cicd-sonarqube:9000"
    }

    stages {
        stage('Checkout') {
            agent {
                docker {
                    image 'oven/bun:alpine'
                }
            }
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            agent {
                docker {
                    image 'oven/bun:alpine'
                }
            }
            steps {
                sh 'bun install --frozen-lockfile || bun install'
            }
        }

        stage('Test') {
            agent {
                docker {
                    image 'node:24-alpine'
                }
            }
            steps {
                sh 'npx vitest run --coverage'
            }
        }

        stage('Trivy Security Scan') {
            agent {
                docker {
                    image 'aquasec/trivy:latest'
                    args '--entrypoint=""'
                }
            }
            steps {
                sh 'trivy fs --severity HIGH,CRITICAL --format sarif --output trivy-results.sarif .'
                recordIssues(tools: [sarif(pattern: 'trivy-results.sarif')], failedTotalHigh: 1)
            }
        }

        stage('SonarQube Analysis') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli:latest'
                    args '--network cicd-network'
                }
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            agent none
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Package Application') {
            agent {
                docker {
                    image 'node:24-alpine'
                }
            }
            steps {
                sh '''
                    apk add --no-cache zip
                    zip -r latest-app.zip . -x "node_modules/*" ".env*" ".next/*" "coverage/*" ".git/*" "trivy-results.sarif"
                '''
            }
        }

        stage('Publish Application') {
            agent none
            steps {
                archiveArtifacts artifacts: 'latest-app.zip', fingerprint: true
                sh 'cp latest-app.zip /var/jenkins_home/userContent/latest-app.zip || true'
            }
        }

        stage('Deploy Application') {
            agent {
                docker {
                    image 'curlimages/curl:latest'
                }
            }
            steps {
                script {
                    sh """
                        curl -X POST "${URL_REDEPLOY}" \\
                             -H "Authorization: Bearer ${DEPLOY_TOKEN}" \\
                             -H "Content-Type: application/json" \\
                             -d '{"website_id": "${WEBSITE_ID}"}'
                    """

                    def attempt = 0
                    def maxAttempts = 120
                    def status = ""

                    while (attempt < maxAttempts) {
                        attempt++
                        sleep 5
                        def response = sh(
                            script: """
                                curl -s "${URL_PROGRESS}" \\
                                     -H "Authorization: Bearer ${DEPLOY_TOKEN}"
                            """,
                            returnStdout: true
                        ).trim()

                        if (response.contains("SUCCESS")) {
                            status = "SUCCESS"
                            echo "Deployment succeeded!"
                            break
                        } else if (response.contains("FAIL")) {
                            status = "FAIL"
                            error("Deployment failed: ${response}")
                        }
                    }

                    if (status != "SUCCESS") {
                        error("Deployment timed out after ${maxAttempts} attempts.")
                    }
                }
            }
        }
    }
}
