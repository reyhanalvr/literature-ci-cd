pipeline {
    agent any
    
    environment {
        REMOTE_SERVER = "${REMOTE_SERVER_STAGING}"
        SSH_USER = "${REMOTE_USER}"
        REPO_DIR = "${REPO_DIR}" 
        SSH_CREDENTIALS = "${SSH_CREDENTIALS}"
        DOCKER_IMAGE = "${DOCKER_IMAGE_STAGING}"
        PORT = "${BACKEND_STAGING_PORT}"
        APP_URL = "${BACKEND_STAGING_URL}"
        CONTAINER_NAME = "backend-staging-test"
    }

    stages {
        stage('Pull dari Staging Repository') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        try {
                            sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                            set -e
                            cd ${REPO_DIR} 
                            git pull origin staging
                            echo "Git Pull Telah Berhasil"
                            exit
                            EOF
                            """
                        } catch (Exception e) {
                            error "Git Pull Gagal: ${e.message}"
                        }
                    }
                }
            }
        }

        stage ('Build docker image') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        try {
                            sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                            set -e
                            cd ${REPO_DIR} 
                            docker build -t ${DOCKER_IMAGE} .
                            docker images
                            echo "Docker Image Build Berhasil"
                            exit
                            EOF
                            """
                        } catch (Exception e) {
                            error "Docker Build Gagal: ${e.message}"
                        }
                    }
                }
            }
        }

        stage ('Run Test Application') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        try {
                            sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                            set -e
                            
                            echo "Menghapus container ${CONTAINER_NAME}"
                            docker rm -f ${CONTAINER_NAME} || true

                            sleep 2

                            echo "Menjalankan container ${CONTAINER_NAME}"
                            docker run -d -p ${PORT}:5000 --name ${CONTAINER_NAME} ${DOCKER_IMAGE}
                            echo "Aplikasi telah dijalankan!"
                            exit
                            EOF
                            """
                        } catch (Exception e) {
                            error "Menjalankan Aplikasi Gagal: ${e.message}"
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
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                            sleep 3
                            if wget --spider --server-response ${APP_URL} 2>&1 | grep -q "404 Not Found"; then
                                echo "Aplikasi berhasil dijalankan"
                            else 
                                echo "Aplikasi gagal dijalankan"
                                exit 1
                            fi
                            exit
                            EOF
                            """
                        } catch (Exception e) {
                            error "Pengujian Aplikasi Gagal: ${e.message}"
                        }
                    }
                }
            }
        }
    }
}
