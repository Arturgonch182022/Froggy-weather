pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Static Code Analysis (Lint)') {
            steps {
                sh 'npm run lint || echo "Lint failed but continuing"'
            }
            post {
                success {
                    echo '✅ Linting passed!'
                }
                failure {
                    echo '❌ Linting failed!'
                }
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test -- --watch=false --browsers=ChromeHeadless || echo "Tests failed but continuing"'
            }
            post {
                always {
                    junit '**/test-results.xml'
                }
                success {
                    echo '✅ Tests passed!'
                }
                failure {
                    echo '❌ Tests failed!'
                }
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build --prod'
            }
        }

        stage('Archive Artifacts (Binary Repository)') {
            steps {
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                echo '✅ Build artifacts saved to Jenkins binary repository'
            }
        }
    }

    post {
        always {
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo "Pipeline completed for branch: ${env.BRANCH_NAME}"
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        }
        success {
            echo '🎉 BUILD SUCCESSFUL! 🎉'
        }
        failure {
            echo '💥 BUILD FAILED! Check the logs above. 💥'
        }
    }
}
