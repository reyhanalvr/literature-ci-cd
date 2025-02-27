@Library('jenkins-shared-library') _

pipeline {
    agent any
    
    environment {
        REMOTE_SERVER = "${REMOTE_SERVER_STAGING}"
        SSH_USER = "${REMOTE_USERNAME_STAGING}"
        REPO_DIR = "${REPO_DIR_STAGING}" 
        SSH_CREDENTIALS = "${SSH_CREDENTIALS}"
        DOCKER_IMAGE = "${DOCKER_IMAGE_STAGING}"
        PORT = "${BACKEND_STAGING_PORT}"
        APP_URL = "${BACKEND_STAGING_URL}"
        CONTAINER_NAME = "${CONTAINER_BE_STAGING}"
        DOCKERHUB_CREDENTIALS = "${DOCKERHUB_CREDENTIALS}"
        DOCKERHUB_REPO = "${DOCKERHUB_BE_REPO}"
        DISCORD_WEBHOOK_URL = "${DISCORD_WEBHOOK_URL}"
        BRANCH = "staging"
    }

    stages {
        stage('Pull Repository') {
            when {
                changeset "literature-backend/**"
            }
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        try {
                            echo "DISCORD_WEBHOOK_URL: ${DISCORD_WEBHOOK_URL}"
                            sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                            cd ${REPO_DIR} 
                            git pull origin ${BRANCH}
                            echo "Git Pull Telah Berhasil"
                            exit
                            EOF
                            """
                            sendDiscordNotification("🚧 *Staging Deployment Notification* 🚧", "Git Pull Berhasil dari branch ${BRANCH}.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Staging Deployment Failed* ❌", "Git Pull Gagal: ${e.message}", "error", DISCORD_WEBHOOK_URL)
                            error("Git Pull failed.")
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            when {
                changeset "literature-backend/**"
            }
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        try {
                            sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                            cd ${REPO_DIR} 
                            docker buildx build --nocache -t ${DOCKER_IMAGE} .
                            echo "Docker Image Build Berhasil"
                            exit
                            EOF
                            """
                            sendDiscordNotification("🚧 *Staging Deployment Notification* 🚧", "Build Docker Image Berhasil dari branch ${BRANCH}.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Docker Build Failed* ❌", "Docker Build Gagal: ${e.message}", "error", DISCORD_WEBHOOK_URL)
                            error("Docker Build failed.")
                        }
                    }
                }
            }
        }

stage('Run and Test Application') {
    when {
        changeset "literature-backend/**"
    }
    steps {
        script {
            sshagent([SSH_CREDENTIALS]) {
                try {
                    sh """
                    ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                    echo "Menghapus container ${CONTAINER_NAME}"
                    docker rm -f ${CONTAINER_NAME} || true

                    sleep 2

                    echo "Menjalankan container ${CONTAINER_NAME}"
                    docker run --rm -d -p ${PORT}:5000 --name ${CONTAINER_NAME} ${DOCKER_IMAGE}
                    echo "Backend running"

                    sleep 3
                    if wget --spider --server-response ${APP_URL} 2>&1 | grep -q "404 Not Found"; then
                        echo "Backend berjalan"
                    else 
                        echo "Backend tidak berjalan"
                        exit 1
                    fi

                    exit
                    EOF
                    """
                    sendDiscordNotification("🚧 *Staging Deployment Notification* 🚧", "Run and Test Application berhasil dari branch ${BRANCH}.", "success", DISCORD_WEBHOOK_URL)
                } catch (Exception e) {
                    sendDiscordNotification("❌ *Run and Test Application Failed* ❌", "Gagal menjalankan atau menguji aplikasi: ${e.message}", "error", DISCORD_WEBHOOK_URL)
                    error("Run and Test Application failed.")
                }
            }
        }
    }
}
        stage('Push Docker Image') {
            when {
                changeset "literature-backend/**"
            }
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                            try {
                                sh """
                                ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                                echo "${DOCKERHUB_PASSWORD}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin
                                docker tag ${DOCKER_IMAGE} ${DOCKERHUB_REPO}:${BRANCH}

                                echo "Melakukan push ke Dockerhub"
                                docker push ${DOCKERHUB_REPO}:${BRANCH}

                                echo "Docker image berhasil di push ke repository"
                                exit
                                EOF
                                """
                                sendDiscordNotification("🚧 *Staging Deployment Notification* 🚧", "Push Docker Image ke Registry Berhasil dari branch ${BRANCH}.", "success", DISCORD_WEBHOOK_URL)
                            } catch (Exception e) {
                                sendDiscordNotification("❌ *Push Docker Image Failed* ❌", "Push Docker Image Gagal: ${e.message}", "error", DISCORD_WEBHOOK_URL)
                                error("Push Docker Image failed.")
                            }
                        }
                    }
                }
            }
        }

        stage('Deploy App on Top Docker') {
            when {
                changeset "literature-backend/**"
            }
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        try {
                            sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                            cd ${REPO_DIR}
                            
                            echo "Deploy aplikasi on top docker"
                            docker compose down backend
                            docker compose pull
                            docker compose up backend -d

                            echo "Aplikasi telah berjalan"
                            exit
                            EOF
                            """
                            sendDiscordNotification("🚧 *Staging Deployment Notification* 🚧", "Deploy Aplikasi on top docker berhasil dari branch ${BRANCH}.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Deployment Failed* ❌", "Deploy aplikasi gagal: ${e.message}", "error", DISCORD_WEBHOOK_URL)
                            error("Deploy App failed.")
                        }
                    }
                }
            }
        }
    }
}
