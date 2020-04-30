#!/bin/sh
set -e

mkdir -p ~/.kube
echo $INPUT_KUBECONFIG | base64 -d > ~/.kube/config

sh -c "kubectl $*"
