pipeline {
    agent any

    environment {
        AWS_REGION = "eu-north-1"
        AWS_ACCOUNT_ID = "551656632415"

        ECR_BACKEND = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/dropshipping-backend"
        ECR_FRONTEND = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/dropshipping-frontend"
        ECR_ADMIN = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/dropshipping-admin"

        IMAGE_TAG = "latest"

        ECS_CLUSTER = "dropshipping-ecs"

        BACKEND_SERVICE = "backend-service"
        FRONTEND_SERVICE = "frontend-service"
        ADMIN_SERVICE = "admin-service"

        ALB_URL = "http://dropshipping-alb-986894571.eu-north-1.elb.amazonaws.com"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/RawatTushar/Dropshipping.git'
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                docker build -t dropshipping-backend ./backend
                docker build -t dropshipping-frontend ./Frontend
                docker build -t dropshipping-admin ./AdminPanel
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                aws ecr get-login-password --region $AWS_REGION | \
                docker login \
                --username AWS \
                --password-stdin \
                ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                '''
            }
        }

        stage('Tag Images') {
            steps {
                sh '''
                docker tag dropshipping-backend:${IMAGE_TAG} ${ECR_BACKEND}:${IMAGE_TAG}
                docker tag dropshipping-frontend:${IMAGE_TAG} ${ECR_FRONTEND}:${IMAGE_TAG}
                docker tag dropshipping-admin:${IMAGE_TAG} ${ECR_ADMIN}:${IMAGE_TAG}
                '''
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                docker push ${ECR_BACKEND}:${IMAGE_TAG}
                docker push ${ECR_FRONTEND}:${IMAGE_TAG}
                docker push ${ECR_ADMIN}:${IMAGE_TAG}
                '''
            }
        }

        stage('Deploy ECS') {
            steps {
                sh '''
                aws ecs update-service \
                    --cluster $ECS_CLUSTER \
                    --service $BACKEND_SERVICE \
                    --force-new-deployment

                aws ecs update-service \
                    --cluster $ECS_CLUSTER \
                    --service $FRONTEND_SERVICE \
                    --force-new-deployment

                aws ecs update-service \
                    --cluster $ECS_CLUSTER \
                    --service $ADMIN_SERVICE \
                    --force-new-deployment
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                sleep 60

                curl --retry 10 \
                     --retry-delay 10 \
                     -f $ALB_URL
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment Successful"
        }

        failure {
            echo "Deployment Failed"
        }
    }
}