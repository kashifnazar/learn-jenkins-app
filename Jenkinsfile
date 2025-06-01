pipeline {
    agent any

    environment {
        NETLIFY_SITE_ID = 'fa31df91-32ab-4b10-91c1-8268accec9c7'
        NETLIFY_AUTH_TOKEN = credentials('netlify')
        REACT_APP_VERSION = "1.0.${BUILD_ID}"
    }

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'my-playwright' 
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
                            image 'my-playwright' 
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
                            image 'my-playwright'
                            reuseNode true
                        }
                    }
                    steps {
                        sh '''
                            npm install serve
                            serve -s build &
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

        stage('Deploy staging + e2e') {
            agent {
                docker {
                    image 'my-playwright'
                    reuseNode true
                }
            }

            environment {
                CI_ENVIRONMENT_URL = "TO BE SET"
            }

            steps {
                sh '''
                    npm i netlify-cli@20.1 node-jq
                    netlify --version
                    echo "Deploying to Project ID: $NETLIFY_SITE_ID to staging"
                    netlify status

                    echo "Deploying now..."
                    netlify deploy --dir=build --json > staging-output.json
                    CI_ENVIRONMENT_URL=$(node-jq -r '.deploy_url' staging-output.json)
                    echo ${CI_ENVIRONMENT_URL}
                    npx playwright test
                '''
            }
            post {
                always{
                    publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, icon: '', keepAll: false, reportDir: 'playwright-report', reportFiles: 'index.html', reportName: 'Playwright Staging', reportTitles: '', useWrapperFileDirectly: true])
                }
            }
        }


        stage('Prod deploy + e2e') {
            agent {
                docker {
                    image 'my-playwright'
                    reuseNode true
                }
            }

            environment {
                CI_ENVIRONMENT_URL = 'https://deluxe-axolotl-4d9d45.netlify.app'
            }

            steps {
                sh '''
                    npm i netlify-cli@20.1
                    netlify --version
                    echo "Deploying to Project ID: $NETLIFY_SITE_ID to production"
                    netlify status

                    echo "Deploying now..."
                    netlify deploy --prod --dir=build
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
