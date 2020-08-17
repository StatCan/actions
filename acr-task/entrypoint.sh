#!/bin/bash

set -o errexit
set -o pipefail

INPUT_DOCKERFILE=${INPUT_DOCKERFILE:-Dockerfile}
INPUT_TAG=${INPUT_TAG:-${GITHUB_SHA::8}}
IMAGE_PART=""

if [ "$INPUT_IMAGE" != "" ]; then
  IMAGE_PART="/${INPUT_IMAGE}"
fi

echo "Building Docker image ${INPUT_REPOSITORY}${IMAGE_PART}:${INPUT_TAG} from ${GITHUB_REPOSITORY} on ${INPUT_BRANCH} and using context ${INPUT_FOLDER} ; and pushing it to ${INPUT_REGISTRY} Azure Container Registry"

az login --service-principal -u ${INPUT_SERVICE_PRINCIPAL} -p "${INPUT_SERVICE_PRINCIPAL_PASSWORD}" --tenant ${INPUT_TENANT}

if [ ! -z "${INPUT_REPOSITORY_CRDS}" ]; then
  echo "Executing against private repository"
  az acr build -r ${INPUT_REGISTRY} -f ${INPUT_DOCKERFILE} -t ${INPUT_REPOSITORY}${IMAGE_PART}:${INPUT_TAG} https://"${INPUT_REPOSITORY_CRDS}"@github.com/${GITHUB_REPOSITORY}.git#${INPUT_BRANCH}:${INPUT_FOLDER}
else
  echo "Executing agaisnt public repository"
  az acr build -r ${INPUT_REGISTRY} -f ${INPUT_DOCKERFILE} -t ${INPUT_REPOSITORY}${IMAGE_PART}:${INPUT_TAG} https://github.com/${GITHUB_REPOSITORY}.git#${INPUT_BRANCH}:${INPUT_FOLDER}
fi

IMAGE_URL=${INPUT_REGISTRY}.azurecr.io/${INPUT_REPOSITORY}${IMAGE_PART}:${INPUT_TAG}
echo "::set-output name=image_url::$IMAGE_URL"
