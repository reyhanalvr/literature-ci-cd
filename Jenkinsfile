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
        DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1289653557783433307/NfDHCLZVmyNW7v7bwUNMyoZ1NYSz0c7CjMgaVZ_bTcaU056lY4EUoAjaEn3ncWzccqCe"
    }

    stages {
        stage('Pull Repository') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                        cd ${REPO_DIR} 
                        git pull origin staging
                        echo "Git Pull Telah Berhasil"
                        exit
                        EOF
                        """
                    }
                    sendDiscordNotification("🚀 *Deployment Notification* 🚀\n\nGit Pull Berhasil dari branch staging.")
                }
            }
        }

        stage ('Build docker image') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                        cd ${REPO_DIR} 
                        docker build -t ${DOCKER_IMAGE} .
                        docker images
                        echo "Docker Image Build Berhasil"
                        exit
                        EOF
                        """
                    }
                }
            }
        }

        stage ('Run Test Application') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                      sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                            
                            echo "Menghapus container ${CONTAINER_NAME}"
                            docker rm -f ${CONTAINER_NAME}

                            sleep 2

                            echo "Menjalankan container ${CONTAINER_NAME}"
                            docker run -d -p ${PORT}:5000 --name ${CONTAINER_NAME} ${DOCKER_IMAGE}
                            echo "Backend running"
                            exit
                            EOF
                            """
                    }
                }
            }
        }
        stage('Test Application'){
            steps{
                script{
                    sshagent([SSH_CREDENTIALS]){
                        sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                            # Menguji aplikasi dengan wget
                            sleep 3
                            if wget --spider --server-response ${APP_URL} 2>&1 | grep -q "404 Not Found"; then
                            echo "Backend berjalan "
                            else 
                                echo "Backend tidak berjalan"
                            fi
                            exit
                            EOF
                        """
                    }
                }
            }
        }
        stage('Push Docker Image'){
            steps{
                script{
                    sshagent([SSH_CREDENTIALS]){
                        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]){
                        sh """
                        ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                        # Login ke Dockerhub
                        echo "${DOCKERHUB_PASSWORD}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin
            
                        docker tag ${DOCKER_IMAGE} ${DOCKERHUB_REPO}:staging

                        echo "Melakukan push ke Dockerhub"
                        docker push ${DOCKERHUB_REPO}:staging

                        sleep 1
                        echo "Docker image berhasil di push ke repository"
                        exit
                        EOF
                        """
                        }
                    }
                }
            }
        }
        stage('Deploy App on Top Docker'){
            steps{
                script{
                    sshagent([SSH_CREDENTIALS]){
                        sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                            cd ${REPO_DIR}
                            
                            echo "Deploy aplikasi on top docker"
                            docker compose down
                            docker compose up -d

                            echo "Aplikasi telah berjalan"
                            exit
                            EOF
                        """
                    }
                }
            }
        }
    }
}

def sendDiscordNotification(String title, String description) {
    def payload = [
        embeds: [
            [
                title: title,
                description: description,
                color: 65280,  // Hijau
                footer: [
                    text: "Notifikasi dari Jenkins"
                ]
            ]
        ]
    ]
    
    sh """
    curl -H "Content-Type: application/json" -d '${groovy.json.JsonOutput.toJson(payload)}' https://discord.com/api/webhooks/${DISCORD_WEBHOOK_URL}
    """
}
