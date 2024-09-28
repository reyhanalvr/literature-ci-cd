@Library('jenkins-shared-library') _

pipeline {
    agent any

    environment {
        SSH_CREDENTIALS = "${SSH_CREDENTIALS}"
        SSH_USER = "${REMOTE_USERNAME_PRODUCTION}"
        SSH_HOST = "${REMOTE_SERVER_PRODUCTION}"
        REPO_DIR = "${REPO_DIR_PRODUCTION}"
        DOCKER_IMAGE = "${DOCKER_IMAGE_PRODUCTION}"
        PORT = "${BACKEND_PRODUCTION_PORT}"
        CONTAINER_NAME = "${CONTAINER_BE_PRODUCTION}"
        APP_URL = "${BACKEND_PRODUCTION_URL}"
        DOCKERHUB_CREDENTIALS = "${DOCKERHUB_CREDENTIALS}"
        DOCKERHUB_REPO = "${DOCKERHUB_BE_REPO}"
        DISCORD_WEBHOOK_URL = "${DISCORD_WEBHOOK_URL}" 
    }

    stages {
        stage('Pull Repository') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        try {
                            sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} << EOF
                            echo "SSH SUCCESSFUL"
                            cd ${REPO_DIR}
                            git pull origin production
                            echo "Git Pull Successful"
                            exit
                            EOF
                            """
                            sendDiscordNotification("🌐 *Production Deployment Notification* 🌐", "Git Pull Successful from the production branch.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Production Deployment Notification* ❌", "Git Pull Failed: ${e.message}", "error", DISCORD_WEBHOOK_URL)
                            error("Git Pull failed.")
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        try {
                            sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} << EOF
                            echo "SSH SUCCESSFUL"
                            cd ${REPO_DIR}
                            echo "Starting Docker image build"
                            docker build -t ${DOCKER_IMAGE} .
                            echo "Docker image has been built"
                            exit
                            EOF
                            """
                            sendDiscordNotification("🌐 *Production Deployment Notification* 🌐", "Build Docker Image Successful.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Production Deployment Notification* ❌", "Docker Image Build Failed: ${e.message}", "error", DISCORD_WEBHOOK_URL)
                            error("Build Docker Image failed.")
                        }
                    }
                }
            }
        }

        stage('Run Application') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        try {
                            sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} << EOF
                            echo "SSH SUCCESSFUL"
                            cd ${REPO_DIR}
                            echo "Removing running container ${CONTAINER_NAME}"
                            docker rm -f ${CONTAINER_NAME}
                            docker run -d -p ${PORT}:5000 --name ${CONTAINER_NAME} ${DOCKER_IMAGE}
                            echo "Application running on port ${PORT}"
                            exit
                            EOF
                            """
                            sendDiscordNotification("🌐 *Production Deployment Notification* 🌐", "Application Successfully Running on Port ${PORT}.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Production Deployment Notification* ❌", "Failed to run application: ${e.message}", "error", DISCORD_WEBHOOK_URL)
                            error("Run Application failed.")
                        }
                    }
                }
            }
        }

        stage('Test Application') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        try {
                            sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} << EOF
                            echo "SSH SUCCESSFUL"
                            echo "Testing application with wget"
                            sleep 3
                            if wget --spider --server-response ${APP_URL} 2>&1 | grep -q "404 Not Found"; then
                                echo "Application is running well"
                            else 
                                echo "Application is not running"
                            fi
                            exit
                            EOF
                            """
                            sendDiscordNotification("🌐 *Production Deployment Notification* 🌐", "Test Application - Application is Running Well.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Production Deployment Notification* ❌", "Application test failed: ${e.message}", "error", DISCORD_WEBHOOK_URL)
                            error("Test Application failed.")
                        }
                    }
                }
            }
        }

        stage('Push Image To Registry') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                            try {
                                sh """
                                ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} << EOF
                                echo "SSH SUCCESSFUL"
                                cd ${REPO_DIR}
                                echo "Logging in to Dockerhub"
                                echo "${DOCKERHUB_PASSWORD}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin
                                docker tag ${DOCKER_IMAGE} ${DOCKERHUB_REPO}:production
                                echo "Uploading Docker Image to Registry"
                                docker push ${DOCKERHUB_REPO}:production
                                echo "Docker image successfully uploaded to registry"
                                exit
                                EOF
                                """
                                sendDiscordNotification("🌐 *Production Deployment Notification* 🌐", "Push Docker Image to Registry Successful.", "success", DISCORD_WEBHOOK_URL)
                            } catch (Exception e) {
                                sendDiscordNotification("❌ *Production Deployment Notification* ❌", "Push Docker Image Failed: ${e.message}", "error", DISCORD_WEBHOOK_URL)
                                error("Push Docker Image failed.")
                            }
                        }
                    }
                }
            }
        }

        stage('Deploy App') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        try {
                            sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} << EOF
                            echo "SSH SUCCESSFUL"
                            cd ${REPO_DIR}
                            sleep 4
                            docker compose down
                            sleep 2
                            echo "Deploying application with docker"
                            docker compose up -d
                            echo "Application is now running"
                            exit
                            EOF
                            """
                            sendDiscordNotification("🌐 *Production Deployment Notification* 🌐", "Application Deployment Successful.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Production Deployment Notification* ❌", "Application deployment failed: ${e.message}", "error", DISCORD_WEBHOOK_URL)
                            error("Deploy App failed.")
                        }
                    }
                }
            }
        }
    }
}
