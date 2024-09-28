pipeleine {
	agent any

	environment {
        SSH_CREDENTIALS = "${SSH_CREDENTIALS}"
	}

	stages {
		stage('Pull Repository'){
			steps {
				script{
					sshagent([SSH_CREDENTIALS])
				}
			}
		}
	}
}
