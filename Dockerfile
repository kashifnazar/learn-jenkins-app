FROM mcr.microsoft.com/playwright:v1.39.0-jammy
RUN npm i -g netlify-cli@20.1 serve
RUN apt update && apt install jq -y