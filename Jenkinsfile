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
      
						echo "Menghapus container ${CONTAINER_NAME} yang berjalan"
						docker rm -f ${CONTAINER_NAME}
      
      						docker run -d -p ${PORT}:5000 --name ${CONTAINER_NAME} ${DOCKER_IMAGE}
	    					echo "App running on port ${PORT}"
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
						sh"""
						ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} << EOF
						echo "SSH BERHASIL"
      
						echo "Menguji aplikasi dengan wget"
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

		stage('Push Image To Registry'){
			steps{
				script{
					sshagent([SSH_CREDENTIALS]){
						withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]){
						sh"""
						ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} << EOF
						echo "SSH BERHASIL"

      						"Dockerhub login"
						echo "${DOCKERHUB_PASSWORD}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin
						
	  					exit
      						EOF
      						"""
					}
				}
			}
		}

	}	
}
