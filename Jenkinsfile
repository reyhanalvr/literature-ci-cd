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

        stage ('Run Application') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                      sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                             if [ \$(docker ps -aq -f name=backend-staging-test) ]; then
                                docker rm -f backend-staging-test
                            fi
                            
                            docker run -d -p ${PORT}:5000 --name backend-staging-test ${DOCKER_IMAGE}
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
                    sh """
                        ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                        if wget --spider --timeout=30 --tries=1 ${APP_URL} | grep -q '404'; then
                            echo "Aplikasi berhasil dijalankan dengan status 404!"
                        elif wget --spider --timeout=30 --tries=1 ${APP_URL} | grep -q '200'; then
                            echo "Aplikasi berjalan dengan baik!"
                        else
                            echo "Aplikasi gagal dijalankan."
                        fi
                        exit
                        EOF
                        """
                }
            }
        }
    }
}
