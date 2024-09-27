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
                    cd ${REPO_DIR}
                    
                    # Print debug information
                    echo "User: \$(whoami)"
                    echo "Home directory: \$HOME"
                    echo "Current directory: \$(pwd)"
                    echo "Shell: \$SHELL"
                    
                    # Try to load NVM
                    export NVM_DIR="/home/team2-staging/.nvm"
                    [ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
                    
                    # If NVM is not available, try to use Node.js directly
                    if ! command -v nvm &> /dev/null; then
                        echo "NVM not found, trying to use Node.js directly"
                        export PATH="/home/team2-staging/.nvm/versions/node/v22.0.0/bin:\$PATH"
                    else
                        echo "NVM found, using it to select Node.js version"
                        nvm use 18 || nvm use --lts || nvm use node
                    fi
                    
                    # Verify Node.js and npm
                    node --version || echo "Node.js not found"
                    npm --version || echo "npm not found"
                    
                    # Print current PATH
                    echo "Current PATH: \$PATH"
                    
                    # Run your commands
                    npm version && echo "Aplikasi telah berjalan"
                    
                    exit
                EOF
                """
                    }
                }
            }
        }
    }
}
