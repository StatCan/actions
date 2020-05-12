#!/bin/sh
set -e

mkdir -p ~/.kube
echo $INPUT_KUBECONFIG | base64 -d > ~/.kube/config

if [[ -f "params.sh" ]]; then
  echo "Executing replacement via yq / envsubst..."
  ./params.sh
fi

sh -c "kubectl $*"
