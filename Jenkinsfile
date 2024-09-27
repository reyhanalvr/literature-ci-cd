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
        DOCKERHUB_CREDENTIALS = "${DOCKERHUB_CREDENTIALS}"
        DOCKERHUB_REPO = "${DOCKERHUB_BE_STAGING_REPO}"

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
                            
                            echo "Menghapus container ${CONTAINER_NAME}"
                            docker rm -f ${CONTAINER_NAME}

                            sleep 2

                            echo "Menjalankan container ${CONTAINER_NAME}"
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
                            sleep 3
                            if wget --spider --server-response ${APP_URL} 2>&1 | grep -q "404 Not Found"; then
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

                        # Melakukan push ke Dockerhub
                        docker push ${DOCKERHUB_REPO}:staging

                        sleep 1
                        # Docker image telah di push ke repository
                        exit
                        EOF
                        """
                        }
                    }
                }
            }
        }
    }
}
