pipeline {
    agent any

    environment {
        NETLIFY_SITE_ID = 'fa31df91-32ab-4b10-91c1-8268accec9c7'
        NETLIFY_AUTH_TOKEN = credentials('netlify')
    }

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

        stage('Tests') {
            parallel {
                stage('Unit tests') {
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

                    post {
                        always{
                            junit 'jest-results/junit.xml'
                        }
                    }
                }

                stage('E2E') {
                    agent {
                        docker {
                            image 'mcr.microsoft.com/playwright:v1.39.0-jammy'
                            reuseNode true
                        }
                    }
                    steps {
                        sh '''
                            npm install serve
                            node_modules/.bin/serve -s build &
                            sleep 10
                            npx playwright test
                        '''
                    }
                    post {
                        always{
                            publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, icon: '', keepAll: false, reportDir: 'playwright-report', reportFiles: 'index.html', reportName: 'Playwright HTML Report', reportTitles: '', useWrapperFileDirectly: true])
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            agent {
                docker {
                    image 'node:18-alpine' 
                    reuseNode true
                }
            }
            steps {
                echo 'Deploying...'
                sh '''
                    npm i netlify-cli@20.1
                    node_modules/.bin/netlify --version
                    echo "Deploying to Project ID: $NETLIFY_PROJECT_ID"
                    node_modules/.bin/netlify status
                '''
            }
        }
    }
}
