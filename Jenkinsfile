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
}

stages {
	stage('Pull Repository'){
	steps {
		script{
			sshagent([SSH_CREDENTIALS]){
				sh """
				ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} << EOF
				echo "SSH BERHASIL"
				
    				cd ${REPO_DIR}
				git pull origin production
    				echo "Git Pull Telah Berhasil"
	
				exit
				EOF
				"""
					}
				}
			}
		}

		stage('Build Docker Image '){
		steps {
			script{
				sshagent([SSH_CREDENTIALS]){
					sh """
					ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} << EOF
					echo "SSH BERHASIL"
					
					cd ${REPO_DIR}

	  				echo "Starting build docker image"
     					docker build -t ${DOCKER_IMAGE} .
	  
					echo "Docker image has been created"
					exit
					EOF
					"""
					}
				}
			}
		}

		stage('Run Application'){
			steps{
				script{
					sshagent([SSH_CREDENTIALS]){
						sh"""
						ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} << EOF
						echo "SSH BERHASIL"
						cd ${REPO_DIR}
						
      						docker run -d -p ${PORT}:5000 --name ${CONTAINER_NAME} ${DOCKER_IMAGE}
	    					"App running on ${PORT}"
      						EOF
      						"""
					}
				}
			}
		}
	
	
	}	
}
