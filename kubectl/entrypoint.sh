#!/bin/sh
set -e

mkdir -p ~/.kube
echo $INPUT_KUBECONFIG | base64 -d > ~/.kube/config

if [[ -f "params.sh" ]]; then
  ./params.sh
fi

sh -c "kubectl $*"
