pipeline {
    agent any

    environment {
        IMAGE_TAG = "latest"
    }

    options {
        retry(2)  
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/RawatTushar/Dropshipping.git'
            }
        }

        stage('Pre-pull base images') {
            steps {
                sh '''
                docker pull node:22-alpine || true
                docker pull nginx:alpine || true
                '''
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                docker compose build --no-cache
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker compose down || true
                docker compose up -d
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                echo "Waiting for service..."
                sleep 30

                curl --retry 5 --retry-delay 5 -f http://localhost:4000/health
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment SUCCESS"
        }

        failure {
            echo "Deployment FAILED "

            sh '''
            docker compose logs --tail=50
            '''
        }
    }
}