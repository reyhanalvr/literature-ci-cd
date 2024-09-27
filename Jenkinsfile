pipeline {
    agent any

    environment {
        REMOTE_SERVER = "${REMOTE_SERVER_STAGING}"
        SSH_USER = "${REMOTE_USER}"
        REPO_DIR = "${REPO_DIR}" 
        SSH_CREDENTIALS = "${SSH_CREDENTIALS}"
        DOCKER_IMAGE = "${DOCKER_IMAGE_STAGING}"
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
               steps{
                   script{
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

        stage ('Install PM2') {
            steps {
                script {
                    sshagent([SSH_CREDENTIALS]) {
                        sh """
                        ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                        npm install pm2 -g || { echo 'Instalasi PM2 Gagal'; exit 1; }
                        echo "PM2 telah terinstal"
                        EOF
                        """
                    }
                }
            }
        }

        stage ('Run Application') {
            steps {
                script{
                    sshagent([SSH_CREDENTIALS]){
                        sh """
                            ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
                            cd ${REPO_DIR}
                            pm2 start ecosystem.config.js || { echo 'PM2 Gagal Menjalankan Aplikasi'; exit 1; }
                            pm2 ls
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
