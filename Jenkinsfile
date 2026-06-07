pipeline {
    agent any

    environment {
        IMAGE_TAG = "latest"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/RawatTushar/Dropshipping.git'
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                docker-compose build
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker-compose down
                docker-compose up -d
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                sleep 15
                curl -f http://localhost:4000/health
                '''
            }
        }
    }

    post {
        failure {
            sh '''
            echo "Deployment failed - rolling back"
            docker-compose down
            docker-compose up -d
            '''
        }
    }
}