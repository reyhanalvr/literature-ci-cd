pipeline {
agent any

environment {
SSH_CREDENTIALS = "${SSH_CREDENTIALS}"
SSH_USER = "${REMOTE_USERNAME_PRODUCTION}"
SSH_HOST = "${REMOTE_SERVER_PRODUCTION}"
}

stages {
	stage('Pull Repository'){
	steps {
		script{
			sshagent([SSH_CREDENTIALS]){
				sh """
				ssh -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} << EOF
				echo "SSH BERHASIL"
				exit
				EOF
				"""
				}
			}
		}
	}
}
}
