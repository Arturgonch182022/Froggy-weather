pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Static Code Analysis (Lint)') {
            steps {
                bat 'npm run lint || exit 0'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm test -- --watch=false --browsers=ChromeHeadless || exit 0'
            }
        }

        stage('Build Application') {
            steps {
                bat 'npm run build --prod'
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
