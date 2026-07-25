# 🛒 Cloud-Native Dropshipping Platform

A production-inspired full-stack dropshipping application built with a microservices architecture and deployed on AWS using ECS Fargate. The project demonstrates scalable cloud infrastructure, automated CI/CD, monitoring, and secure networking using AWS best practices.

---

# 🚀 Live Demo

### Customer Website

https://d2nkmjxm0c6wcn.cloudfront.net

### Admin Panel

https://d2nkmjxm0c6wcn.cloudfront.net/admin/

### Backend API (Application Load Balancer)

http://dropshipping-alb-vpc-662035141.eu-north-1.elb.amazonaws.com

### Grafana Dashboard

http://dropshipping-alb-vpc-662035141.eu-north-1.elb.amazonaws.com/grafana/

---

# 📖 Project Overview

This project simulates a real-world dropshipping platform where customers can browse products, place orders, and manage their accounts while administrators manage inventory, products, users, and orders through a dedicated admin portal.

The application follows modern DevOps practices including containerization, cloud-native deployment, infrastructure isolation, automated CI/CD, monitoring, and secure networking.

---

# ✨ Features

## Customer

- User Registration & Login
- Browse Products
- Product Categories
- Product Details
- Shopping Cart
- Secure Checkout
- Order History
- Responsive UI

## Admin

- Secure Authentication
- Dashboard
- Product Management
- Inventory Management
- Category Management
- Order Management
- User Management

---

# 🏗 Architecture

```
                               Internet
                                   │
                           Internet Gateway
                                   │
                        AWS CloudFront Distribution
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        │                          │                          │
   Default (*)                 /admin/*                  /api/* & /grafana/*
        │                          │                          │
        │                          │                          │
Frontend S3 Bucket         Admin S3 Bucket        Application Load Balancer
                                                        (Public Subnets)
                                                            │
                                                ALB Security Group (ALB-SG)
                                                            │
                       ┌────────────────────────────────────┴────────────────────────────────────┐
                       │                                                                         │
                Amazon ECS Fargate                                                      Grafana Service
            (Backend + Prometheus)                                                     (Private Subnet)
               Backend Security Group
                       │
                       │
                 Amazon RDS PostgreSQL
                 RDS Security Group
                  (Private Subnets)

────────────────────────────────────────────────────────────────────────────────────────────

                              VPC Networking

                   Public Subnets                     Private Subnets
             ┌─────────────────────┐          ┌────────────────────────────┐
             │ Application Load    │          │ Amazon ECS Backend         │
             │ Balancer            │          │ Prometheus                 │
             │ NAT Gateway         │          │ Grafana                    │
             └─────────────────────┘          │ Amazon RDS PostgreSQL      │
                                              └────────────────────────────┘
                      │
              Internet Gateway
                      │
                  Internet
```

---

# CI/CD 
GitHub Repository
        │
GitHub Actions
(Dorny Paths Filter)
        │
 ┌──────┼─────────┐
 │      │         │
 │      │         │
Frontend Backend Admin
 │      │         │
CodeBuild CodeBuild CodeBuild
 │      │         │
S3   Docker→ECR   S3
 │      │         │
 └──────┴─────────┘
        │
AWS CodePipeline
        │
Frontend/Admin → S3 + CloudFront
Backend → Amazon ECS Fargate

# ☁ AWS Architecture

## Networking

- Custom Amazon VPC with separate public and private subnets
- Public Subnets host the Application Load Balancer and NAT Gateway
- Private Subnets host ECS Fargate backend tasks and Amazon RDS PostgreSQL
- Internet Gateway attached to the VPC for inbound/outbound internet traffic
- NAT Gateway in public subnets to allow private ECS tasks to reach external services safely
- Route tables:
  - public route table for public subnet traffic via Internet Gateway
  - private route table for backend/ECS traffic via NAT Gateway

## Security Groups

- `alb-sg` for Application Load Balancer
  - allows inbound HTTP/HTTPS from the internet
  - allows outbound traffic to backend ECS service
- `backend-sg` for ECS backend tasks
  - allows inbound traffic from `alb-sg`
  - allows outbound traffic to the internet via NAT Gateway and to RDS
- `rds-sg` for Amazon RDS PostgreSQL
  - allows inbound Postgres traffic from `backend-sg`
  - blocks direct public access

## Compute

- Amazon ECS Fargate running backend containers in private subnets
- Amazon ECR storing backend Docker images

## Storage & Delivery

- Amazon S3 hosting frontend and admin build assets
- Amazon CloudFront distributing frontend and admin assets globally

## Database

- Amazon RDS PostgreSQL in private subnets behind `rds-sg`

> **Note:** The project was initially built using MongoDB Atlas and later migrated to Amazon RDS PostgreSQL.

## Compute

- Amazon ECS Fargate
- Amazon ECR

## Storage & Delivery

- Amazon S3
- Amazon CloudFront

## Database

- Amazon RDS PostgreSQL

> **Note:** The project was initially built using MongoDB Atlas and later migrated to Amazon RDS PostgreSQL.

---

# ⚙ Tech Stack

## Frontend

- React.js
- Axios
- React Router
- Tailwind CSS

## Backend

- Node.js
- Express.js
- JWT Authentication
- REST APIs

## Database

- Amazon RDS PostgreSQL

## Monitoring

- Prometheus
- Grafana

## DevOps

- Docker
- Jenkins
- GitHub Actions
- AWS CodePipeline
- AWS CodeBuild

---

# 🔄 CI/CD Workflow

## Jenkins

- Continuous Integration
- Application Build
- Docker Image Creation
- Testing

## GitHub Actions

- Detect modified folders using **Dorny/Paths Filter**
- Trigger only the required AWS CodePipeline

## AWS CodePipeline

- Separate pipeline for Backend
- Separate pipeline for Frontend
- Separate pipeline for Admin Panel

## AWS CodeBuild

### Backend

- Build Docker Image
- Push Image to Amazon ECR
- Deploy Updated Task Definition to ECS

### Frontend

- Build React Application
- Upload to Amazon S3
- CloudFront Cache Invalidation

### Admin Panel

- Build React Application
- Upload to Amazon S3
- CloudFront Cache Invalidation

---

# 🌐 Request Flow

Customer

CloudFront

↓

S3 (Frontend)

↓

Application Load Balancer

↓

Amazon ECS Backend

↓

Amazon RDS PostgreSQL

---

# 📊 Monitoring

Application monitoring is implemented using:

- Prometheus Metrics Collection
- Grafana Dashboards
- ECS Health Checks
- ALB Health Checks
- CloudWatch Logs

---

# 🐳 Containerization

Docker is used to containerize the backend service.

Deployment is managed using:

- Amazon ECS Fargate
- Amazon ECR

---

# 🔒 Security

- JWT Authentication
- Environment Variables
- Private Database Subnets
- Security Groups
- Least Privilege IAM
- ALB Routing
- CORS Configuration

---

# 📂 Project Structure

```
Dropshipping/
│
├── Frontend/
│
├── AdminPanel/
│
├── backend/
│
├── docker-compose.yml
│
├── Jenkinsfile
│
├── README.md
│
└── .github/
      workflows/
```

---

# 📸 Screenshots

Include screenshots of:

- Customer Home Page
- Product Details
- Shopping Cart
- Admin Dashboard
- GitHub Actions Workflow
- Jenkins Pipeline
- AWS CodePipeline
- AWS CodeBuild
- Amazon ECS
- Amazon ECR
- CloudFront Distribution
- Application Load Balancer
- Amazon RDS
- Prometheus Dashboard
- Grafana Dashboard

---

# ⚡ Challenges Solved

- Migrated from MongoDB Atlas to Amazon RDS PostgreSQL.
- Migrated from Docker Compose deployment to Amazon ECS Fargate.
- Configured secure networking using custom VPC with public/private subnets.
- Implemented path-specific deployments using GitHub Actions and Dorny Paths Filter.
- Configured Application Load Balancer routing for backend and Grafana.
- Connected CloudFront with the backend through the Application Load Balancer.
- Integrated Prometheus and Grafana for application monitoring.
- Built independent deployment pipelines for frontend, backend, and admin panel.

---

# 🎯 Key Achievements

- Designed a scalable cloud-native architecture on AWS.
- Automated CI/CD using Jenkins, GitHub Actions, AWS CodePipeline, and AWS CodeBuild.
- Reduced unnecessary deployments through path-based pipeline triggering.
- Containerized backend using Docker and deployed to Amazon ECS Fargate.
- Secured infrastructure using VPC, NAT Gateway, Internet Gateway, and Security Groups.
- Implemented centralized monitoring with Prometheus and Grafana.
- Delivered frontend and admin panel globally using Amazon CloudFront.

---

# 🚀 Future Improvements

- Infrastructure as Code using Terraform
- Kubernetes Deployment (Amazon EKS)
- Auto Scaling Policies
- AWS WAF Integration
- Blue-Green Deployment
- Canary Deployment

---

# 👨‍💻 Author

**Tushar Rawat**

DevOps & Cloud Engineer

AWS | Docker | ECS | Jenkins | GitHub Actions | CI/CD | CloudFront | RDS | Prometheus | Grafana

---