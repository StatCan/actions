#!/bin/bash
# Initially developed by https://github.com/stefanprodan/gh-actions

set -o errexit
set -o pipefail

function print_info() {
    echo -e "\e[36mINFO: ${1}\e[m"
}

function print_error() {
    echo -e "\e[36mERROR: ${1}\e[m"
}

package() {
  helm lint ${CHART}
  mkdir -p /github/home/pkg
  print_info "Package Helm chart"
  helm package ${CHART} --destination /github/home/pkg/
}

push() {
  git config user.email ${GITHUB_ACTOR}@users.noreply.github.com
  git config user.name ${GITHUB_ACTOR}
  git remote set-url origin ${REPOSITORY}
  git checkout gh-pages
  mv /github/home/pkg/*.tgz .
  helm repo index . --url ${URL}
  print_info "Push to gh-pages"
  git add .
  git commit -m "Publish Helm chart ${CHART}"
  git push origin gh-pages
}

if [ -n "${ACTIONS_DEPLOY_KEY}" ]; then
  print_info "setup with ACTIONS_DEPLOY_KEY"
  if [ -n "${SCRIPT_MODE}" ]; then
    print_info "run as SCRIPT_MODE"
    SSH_DIR="${HOME}/.ssh"
  else
    SSH_DIR="/root/.ssh"
  fi
  mkdir -p "${SSH_DIR}"
  eval "$(ssh-agent -s)"
  ssh-add - <<< "${ACTIONS_DEPLOY_KEY}"
  REPOSITORY="git@github.com:${GITHUB_REPOSITORY}.git"
elif [ -n "${GITHUB_TOKEN}" ]; then
  print_info "setup with GITHUB_TOKEN"
  print_error "GITHUB_TOKEN works only private repo,"
  REPOSITORY="https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
else
  print_error "not found ACTIONS_DEPLOY_KEY, GITHUB_TOKEN"
  exit 1
fi

CHART=$1
if [[ -z $1 ]] ; then
  echo "Chart path parameter needed!" && exit 1;
fi

URL=$2
if [[ -z $2 ]] ; then
  echo "Helm repository URL parameter needed!" && exit 1;
fi

package
push
