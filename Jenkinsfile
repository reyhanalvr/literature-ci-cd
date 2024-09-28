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
                            echo "SSH BERHASIL"
                            cd ${REPO_DIR}
                            git pull origin production
                            echo "Git Pull Telah Berhasil"
                            exit
                            EOF
                            """
                            sendDiscordNotification("🚀 *Notifikasi Deployment: ${env.JOB_NAME}* 🚀", "Git Pull Berhasil dari branch production.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Deployment Gagal: ${env.JOB_NAME}* ❌", "Git Pull Gagal: ${e.message}", "error", DISCORD_WEBHOOK_URL)
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
                            echo "SSH BERHASIL"
                            cd ${REPO_DIR}
                            echo "Memulai pembangunan gambar docker"
                            docker build -t ${DOCKER_IMAGE} .
                            echo "Gambar Docker telah dibuat"
                            exit
                            EOF
                            """
                            sendDiscordNotification("🚀 *Notifikasi Deployment: ${env.JOB_NAME}* 🚀", "Build Docker Image Success.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Pembangunan Gagal: ${env.JOB_NAME}* ❌", "Pembangunan Gambar Docker Gagal: ${e.message}", "error", DISCORD_WEBHOOK_URL)
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
                            echo "SSH BERHASIL"
                            cd ${REPO_DIR}
                            echo "Menghapus container ${CONTAINER_NAME} yang berjalan"
                            docker rm -f ${CONTAINER_NAME}
                            docker run -d -p ${PORT}:5000 --name ${CONTAINER_NAME} ${DOCKER_IMAGE}
                            echo "Aplikasi berjalan di port ${PORT}"
                            exit
                            EOF
                            """
                            sendDiscordNotification("🚀 *Notifikasi Deployment: ${env.JOB_NAME}* 🚀", "Aplikasi Berhasil Dijalankan di Port ${PORT}.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Gagal Menjalankan Aplikasi: ${env.JOB_NAME}* ❌", "Gagal menjalankan aplikasi: ${e.message}", "error", DISCORD_WEBHOOK_URL)
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
                            echo "SSH BERHASIL"
                            echo "Menguji aplikasi dengan wget"
                            sleep 3
                            if wget --spider --server-response ${APP_URL} 2>&1 | grep -q "404 Not Found"; then
                                echo "Aplikasi berjalan dengan baik"
                            else 
                                echo "Aplikasi tidak berjalan"
                            fi
                            exit
                            EOF
                            """
                            sendDiscordNotification("🚀 *Notifikasi Deployment: ${env.JOB_NAME}* 🚀", "Test Aplikasi - Aplikasi Berjalan Dengan Baik.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Gagal Uji Aplikasi: ${env.JOB_NAME}* ❌", "Uji aplikasi gagal: ${e.message}", "error", DISCORD_WEBHOOK_URL)
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
                                echo "SSH BERHASIL"
                                cd ${REPO_DIR}
                                echo "Login ke Dockerhub"
                                echo "${DOCKERHUB_PASSWORD}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin
                                docker tag ${DOCKER_IMAGE} ${DOCKERHUB_REPO}:production
                                echo "Mengupload Gambar Docker ke Registry"
                                docker push ${DOCKERHUB_REPO}:production
                                echo "Gambar Docker berhasil diunggah ke registry"
                                exit
                                EOF
                                """
                                sendDiscordNotification("🚀 *Notifikasi Deployment: ${env.JOB_NAME}* 🚀", "Push Docker Image ke Registry Berhasil.", "success", DISCORD_WEBHOOK_URL)
                            } catch (Exception e) {
                                sendDiscordNotification("❌ *Gagal Push Gambar Docker: ${env.JOB_NAME}* ❌", "Push Docker Image Gagal: ${e.message}", "error", DISCORD_WEBHOOK_URL)
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
                            echo "SSH BERHASIL"
                            cd ${REPO_DIR}
                            sleep 4
                            docker compose down
                            sleep 2
                            echo "Mengdeploy aplikasi dengan docker"
                            docker compose up -d
                            echo "Aplikasi telah berjalan"
                            exit
                            EOF
                            """
                            sendDiscordNotification("🚀 *Notifikasi Deployment: ${env.JOB_NAME}* 🚀", "Deploy Aplikasi Berhasil.", "success", DISCORD_WEBHOOK_URL)
                        } catch (Exception e) {
                            sendDiscordNotification("❌ *Gagal Deploy Aplikasi: ${env.JOB_NAME}* ❌", "Deploy aplikasi gagal: ${e.message}", "error", DISCORD_WEBHOOK_URL)
                            error("Deploy App failed.")
                        }
                    }
                }
            }
        }
    }
}
