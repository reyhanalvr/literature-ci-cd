pipeline {
    agent any
    
    environment {
        REMOTE_SERVER = "${REMOTE_SERVER_STAGING}"
        SSH_USER = "${REMOTE_USER}"
        REPO_DIR = "${REPO_DIR}" 
        SSH_CREDENTIALS = "${SSH_CREDENTIALS}"
        DOCKER_IMAGE = "${DOCKER_IMAGE_STAGING}"
        APP_URL =  "http://103.196.153.95:5000/"
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

        stage ('Build & Run Application') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                      sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                            wget --spider --timeout=30 --tries=1 ${APPURL}
                            echo "Selesai Testing!"
                            exit
                        EOF
                    """
                    }
                }
            }
        }
    }
}
