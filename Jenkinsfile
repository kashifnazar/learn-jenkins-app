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

                stage('Local E2E') {
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
                            publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, icon: '', keepAll: false, reportDir: 'playwright-report', reportFiles: 'index.html', reportName: 'Playwright Local', reportTitles: '', useWrapperFileDirectly: true])
                        }
                    }
                }
            }
        }

        stage('Deploy staging') {
            agent {
                docker {
                    image 'node:18-alpine' 
                    reuseNode true
                }
            }
            steps {
                sh '''
                    npm i netlify-cli@20.1 node-jq
                    node_modules/.bin/netlify --version
                    echo "Deploying to Project ID: $NETLIFY_SITE_ID to staging"
                    node_modules/.bin/netlify status

                    echo "Deploying now..."
                    node_modules/.bin/netlify deploy --dir=build --json > staging-output.json
                    script {
                        env.DEPLOY_ID = sh(script: 'node_modules/.bin/node-jq -r '.deploy_id' staging-output.json', returnStdout)
                    }
                '''
            }
        }

        stage('Staging E2E') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.39.0-jammy'
                    reuseNode true
                }
            }

            environment {
                CI_ENVIRONMENT_URL = "https://${env.DEPLOY_ID}deluxe-axolotl-4d9d45.netlify.app"
            }

            steps {
                sh '''
                    echo ${CI_ENVIRONMENT}
                    npx playwright test
                '''
            }
            post {
                always{
                    publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, icon: '', keepAll: false, reportDir: 'playwright-report', reportFiles: 'index.html', reportName: 'Playwright Staging', reportTitles: '', useWrapperFileDirectly: true])
                }
            }
        }

        stage('Approval') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    input cancel: 'Not yet', message: 'Ready to deploy?', ok: 'Yes, all good'
                }   
            }
        }

        stage('Deploy prod') {
            agent {
                docker {
                    image 'node:18-alpine' 
                    reuseNode true
                }
            }
            steps {
                sh '''
                    npm i netlify-cli@20.1
                    node_modules/.bin/netlify --version
                    echo "Deploying to Project ID: $NETLIFY_SITE_ID to production"
                    node_modules/.bin/netlify status

                    echo "Deploying now..."
                    node_modules/.bin/netlify deploy --prod --dir=build
                '''
            }
        }

        stage('Prod E2E') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.39.0-jammy'
                    reuseNode true
                }
            }

            environment {
                CI_ENVIRONMENT_URL = 'https://deluxe-axolotl-4d9d45.netlify.app'
            }

            steps {
                sh '''
                    npx playwright test
                '''
            }
            post {
                always{
                    publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, icon: '', keepAll: false, reportDir: 'playwright-report', reportFiles: 'index.html', reportName: 'Playwright Prod', reportTitles: '', useWrapperFileDirectly: true])
                }
            }
        }
    }
}
