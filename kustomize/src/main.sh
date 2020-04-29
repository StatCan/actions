#!/bin/bash

function main {
  ./params.sh
  kubectl apply -k .
}

main "${*}"