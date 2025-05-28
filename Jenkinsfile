pipeline {
    agent any

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:18-alpine' 
                    reuseNode true
                }
            }
            steps {
                echo 'Building...'
                sh '''
                    ls -la
                    npm ci
                    npm run build
                    ls -la
                '''
            }
        }

        stage('Test') {
            agent {
                docker {
                    image 'node:18-alpine' 
                    reuseNode true
                }
            }
            steps {
                echo 'Testing...'
                sh '''
                    test -e build/index.html

                    #Running test
                    npm test
                '''
            }
        }
        stage('E2E') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.52.0-noble'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    npm install -g serve
                    serve -s build
                    npx playwright test
                '''
            }
        }
    }
    post {
        always{
            junit 'test-results/junit.xml'
        }
    }
}
