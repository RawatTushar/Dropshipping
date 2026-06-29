pipeline {
    agent any

    environment {
        AWS_REGION = "eu-north-1"
        AWS_ACCOUNT_ID = "551656632415"

        ECR_BACKEND = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/dropshipping-backend"

        IMAGE_TAG = "latest"

        ECS_CLUSTER = "dropshipping-ecs"
        BACKEND_SERVICE = "backend-service"

        CLOUDFRONT_DISTRIBUTION = "EU2GD4RRXDM86"

        FRONTEND_BUCKET = "dropshipping-frontend"
        ADMIN_BUCKET = "dropshipping-admin"

        ALB_URL = "http://dropshipping-alb-986894571.eu-north-1.elb.amazonaws.com"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/RawatTushar/Dropshipping.git'
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                docker build -t dropshipping-backend ./backend
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

        stage('Push Backend') {
            steps {
                sh '''
                docker tag dropshipping-backend:${IMAGE_TAG} ${ECR_BACKEND}:${IMAGE_TAG}

                docker push ${ECR_BACKEND}:${IMAGE_TAG}
                '''
            }
        }

        stage('Deploy Backend ECS') {
            steps {
                sh '''
                aws ecs update-service \
                    --cluster $ECS_CLUSTER \
                    --service $BACKEND_SERVICE \
                    --force-new-deployment
                '''
            }
        }
stage('Build Frontend') {
    steps {
        dir('Frontend') {
            sh '''
            export npm_config_cache=/tmp/npm-cache
            mkdir -p /tmp/npm-cache
            npm ci
            npm run build
            '''
        }
    }
}


        stage('Upload Frontend') {
            steps {
                sh '''
                aws s3 sync Frontend/dist/ s3://${FRONTEND_BUCKET} --delete
                '''
            }
        }

   stage('Build Admin') {
    steps {
        dir('AdminPanel') {
            sh '''
            export npm_config_cache=/tmp/npm-cache
            mkdir -p /tmp/npm-cache
            npm ci
            npm run build
            '''
        }
    }
}

        stage('Upload Admin') {
            steps {
                sh '''
                aws s3 sync AdminPanel/dist/ s3://${ADMIN_BUCKET} --delete
                '''
            }
        }

        stage('Invalidate CloudFront') {
            steps {
                sh '''
                aws cloudfront create-invalidation \
                --distribution-id ${CLOUDFRONT_DISTRIBUTION} \
                --paths "/*"
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                sleep 30

                curl --retry 10 \
                     --retry-delay 5 \
                     -f $ALB_URL/api/health || true
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