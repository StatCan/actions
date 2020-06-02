FROM alpine:3.11

RUN ["/bin/sh", "-c", "apk add --update --no-cache bash ca-certificates curl git libc6-compat openssh"]

# envsubst
ENV BUILD_DEPS="gettext"  \
    RUNTIME_DEPS="libintl"

RUN set -x && \
    apk add --update $RUNTIME_DEPS && \
    apk add --virtual build_deps $BUILD_DEPS &&  \
    cp /usr/bin/envsubst /usr/local/bin/envsubst && \
    apk del build_deps

# yq
RUN wget $(curl -s https://api.github.com/repos/mikefarah/yq/releases/latest | grep browser_download_url | grep linux_amd64 | cut -d '"' -f 4) -O /usr/bin/yq && \
    chmod +x /usr/bin/yq

# kubectl
ENV KUBE_VERSION="v1.17.5"

RUN apk add --update ca-certificates \
 && apk add --update -t deps curl \
 && curl -L https://storage.googleapis.com/kubernetes-release/release/${KUBE_VERSION}/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl \
 && chmod +x /usr/local/bin/kubectl \
 && apk del --purge deps \
 && rm /var/cache/apk/*

# kfctl
ENV KFCTL_VERSION="v1.0.2"
ENV KFCTL_HASH="ga476281"

RUN apk add --update ca-certificates \
 && apk add --update -t deps curl \
 && curl -L https://github.com/kubeflow/kfctl/releases/download/${KFCTL_VERSION}/kfctl_${KFCTL_VERSION}-0-${KFCTL_HASH}_linux.tar.gz | tar xzf - \
 && mv kfctl /usr/local/bin/kfctl \
 && apk del --purge deps \
 && rm /var/cache/apk/*

# argo
ENV ARGO_VERSION="v2.8.1"

RUN apk add --update ca-certificates \
 && apk add --update -t deps curl \
 && curl -L https://github.com/argoproj/argo/releases/download/${ARGO_VERSION}/argo-linux-amd64 -o /usr/local/bin/argo \
 && chmod +x /usr/local/bin/argo \
 && apk del --purge deps \
 && rm /var/cache/apk/*

COPY entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]
