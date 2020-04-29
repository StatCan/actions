FROM node:13-alpine

LABEL "name"="Helm action"
LABEL "maintainer"="William Hearn <william.hearn@canada.ca>"
LABEL "version"="1.0.0"

LABEL "com.github.actions.icon"="package"
LABEL "com.github.actions.color"="green"
LABEL "com.github.actions.name"="Helm"
LABEL "com.github.actions.description"="This is an Action to deploy a Helm chart."

ENV HELM_2="v2.13.1"
ENV HELM_3="v3.0.0"

RUN apk add --update --no-cache ca-certificates \
      jq \
      curl \
      bash && \
    curl -L "https://get.helm.sh/helm-${HELM_2}-linux-amd64.tar.gz" | tar -xvz && \
    mv linux-amd64/helm /usr/bin/helm && \
    chmod +x /usr/bin/helm && \
    rm -rf linux-amd64 && \
    curl -L "https://get.helm.sh/helm-${HELM_3}-linux-amd64.tar.gz" | tar -xvz && \
    mv linux-amd64/helm /usr/bin/helm3 && \
    chmod +x /usr/bin/helm3 && \
    rm -rf linux-amd64

RUN helm init --client-only

WORKDIR /usr/src/app

COPY . ./

RUN yarn install

EXPOSE 8080
CMD [ "node", "/usr/src/app/index.js" ]
