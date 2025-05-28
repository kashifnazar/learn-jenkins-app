pipeline {
    agent any

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:18-alpine' 
                }
            }
            steps {
                echo 'Building...'
                sh '''
                    ls -la
                    pnpm ci
                    pnpm run build
                    ls -la
                '''
            }
        }
    }
}
