pipeline {
    agent any
    tools {
        nodejs "npm"
    }
    
    environment {
        REMOTE_SERVER = "${REMOTE_SERVER_STAGING}"
        SSH_USER = "${REMOTE_USER}"
        REPO_DIR = "${REPO_DIR}" 
        SSH_CREDENTIALS = "${SSH_CREDENTIALS}"
        DOCKER_IMAGE = "${DOCKER_IMAGE_STAGING}"
    }
    stages {
        stage('Verify Node.js Installation') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }
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
                    # Switch to team2-staging user
                    sudo su - team2-staging << EOT
                    
                    cd ${REPO_DIR}
                    
                    # Print debug information
                    echo "User: \$(whoami)"
                    echo "Home directory: \$HOME"
                    echo "Current directory: \$(pwd)"
                    echo "Shell: \$SHELL"
                    
                    # Load NVM
                    export NVM_DIR="\$HOME/.nvm"
                    [ -s "\$NVM_DIR/nvm.sh" ] && \\. "\$NVM_DIR/nvm.sh"
                    [ -s "\$NVM_DIR/bash_completion" ] && \\. "\$NVM_DIR/bash_completion"
                    
                    # Verify NVM is loaded
                    command -v nvm
                    
                    # List available Node.js versions
                    nvm ls
                    
                    # Use the desired Node.js version (adjust as needed)
                    nvm use 22 || nvm use --lts || nvm use node
                    
                    # Verify Node.js and npm
                    node --version
                    npm --version
                    
                    # Print current PATH
                    echo "Current PATH: \$PATH"
                    
                    # Run your commands
                    npm version && echo "Aplikasi telah berjalan"
                    
                    EOT
                    exit
                EOF
                """
                    }
                }
            }
        }
    }
}
