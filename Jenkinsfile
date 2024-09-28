pipeline {
agent any

environment {
SSH_CREDENTIALS = "${SSH_CREDENTIALS}"
}

stages {
	stage('Pull Repository'){
	steps {
		script{
			sshagent([SSH_CREDENTIALS]){
				sh """
				ssh -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER} << EOF
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
