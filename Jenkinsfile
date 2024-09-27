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
                        sh """
                        ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                        cd ${REPO_DIR} 
                        git pull origin staging
                        echo "Git Pull Telah Berhasil"
                        exit
                        EOF
                        """
                    }
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
                            if [ \$(docker ps -aq -f name=${CONTAINER_NAME}) ]; then
                                echo "Menghapus container ${CONTAINER_NAME}"
                                docker rm -f ${CONTAINER_NAME}
                            fi
                            
                            docker run -d -p ${PORT}:5000 --name ${CONTAINER_NAME} ${DOCKER_IMAGE}
                            echo "Aplikasi telah dijalankan!"
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
                            if [wget --spider -q --server-response http://127.0.0.1:5009/ 2>&1 | grep "404 Not Found"; then
                            echo "Aplikasi berhasil dijalankan"
                            else 
                                echo "Aplikasi gagal dijalankan"
                            fi
                            exit
                            EOF
                        """
                    }
                }
            }
        }
    }
}
